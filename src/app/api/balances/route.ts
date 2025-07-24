import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { getRpcUrlsForChain } from './chains.server.config'
import { z } from 'zod'
import { TokenBalance, BalancesApiResponse, BalancesApiError } from '@/interfaces'

// Make direct JSON-RPC call
async function makeRpcCall(rpcUrl: string, method: string, params: unknown[]) {
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: 1,
        }),
    })

    const data = await response.json()
    if (data.error) {
        throw new Error(data.error.message || 'RPC Error')
    }

    return data.result
}

// Request validation schema
const BalancesRequestSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    tokenAddresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)),
    chainId: z.number(),
})

export async function POST(request: NextRequest): Promise<NextResponse<BalancesApiResponse | BalancesApiError>> {
    try {
        // Parse and validate request body
        const body = await request.json()
        const validationResult = BalancesRequestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json({ error: 'Invalid request parameters: ' + validationResult.error.message }, { status: 400 })
        }

        const { walletAddress, tokenAddresses, chainId } = validationResult.data

        // Get chain configuration
        const chainConfig = CHAINS_CONFIG[chainId]
        if (!chainConfig) {
            return NextResponse.json({ error: `Unsupported chain ID: ${chainId}` }, { status: 400 })
        }

        // Find a working RPC URL
        const rpcUrls = getRpcUrlsForChain(chainId)

        let workingRpcUrl: string | null = null

        for (const rpcUrl of rpcUrls) {
            try {
                // Test if RPC is working
                await makeRpcCall(rpcUrl, 'eth_chainId', [])
                workingRpcUrl = rpcUrl
                break
            } catch {
                continue
            }
        }

        if (!workingRpcUrl) {
            return NextResponse.json({ error: 'Failed to connect to blockchain network' }, { status: 500 })
        }

        // Fetch balances using direct RPC calls
        const balancePromises = tokenAddresses.map(async (tokenAddress): Promise<TokenBalance> => {
            try {
                // Handle native token (ETH)
                if (tokenAddress === ethers.constants.AddressZero) {
                    const balance = await makeRpcCall(workingRpcUrl, 'eth_getBalance', [walletAddress, 'latest'])
                    return {
                        address: tokenAddress,
                        balance: ethers.BigNumber.from(balance).toString(),
                        decimals: 18,
                        symbol: 'ETH',
                    }
                }

                // Handle ERC20 tokens
                // Get balance
                const balanceData = ethers.utils.defaultAbiCoder
                    .encode(['bytes4', 'address'], [ethers.utils.id('balanceOf(address)').slice(0, 10), walletAddress])
                    .slice(2)

                const balanceResult = await makeRpcCall(workingRpcUrl, 'eth_call', [{ to: tokenAddress, data: '0x' + balanceData }, 'latest'])

                // Get decimals
                const decimalsData = ethers.utils.id('decimals()').slice(0, 10)
                const decimalsResult = await makeRpcCall(workingRpcUrl, 'eth_call', [{ to: tokenAddress, data: decimalsData }, 'latest'])

                // Get symbol (optional)
                let symbol: string | undefined
                try {
                    const symbolData = ethers.utils.id('symbol()').slice(0, 10)
                    const symbolResult = await makeRpcCall(workingRpcUrl, 'eth_call', [{ to: tokenAddress, data: symbolData }, 'latest'])
                    symbol = ethers.utils.defaultAbiCoder.decode(['string'], symbolResult)[0]
                } catch {
                    symbol = undefined
                }

                return {
                    address: tokenAddress,
                    balance: ethers.BigNumber.from(balanceResult || '0x0').toString(),
                    decimals: parseInt(decimalsResult, 16) || 18,
                    symbol,
                }
            } catch {
                return {
                    address: tokenAddress,
                    balance: '0',
                    decimals: 18,
                    symbol: undefined,
                }
            }
        })

        const balances = await Promise.all(balancePromises)

        return NextResponse.json({ balances })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

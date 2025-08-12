'use client'

import { useEffect, useState } from 'react'
import { CHAINS_CONFIG } from '@/config/chains.config'

interface UseEthBalanceParams {
    walletAddress?: string
    chainId?: number
}

export function useEthBalance({ walletAddress, chainId }: UseEthBalanceParams) {
    const [balance, setBalance] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!walletAddress || !chainId) {
            setBalance(0)
            return
        }

        const fetchBalance = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch('/api/balances', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress,
                        tokenAddresses: [],
                        chainId,
                        includeNative: true,
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch balance')
                }

                const data = await response.json()
                const nativeBalance = data.balances?.find(
                    (b: { address: string; balance: string; decimals: number; symbol?: string }) =>
                        b.address === '0x0000000000000000000000000000000000000000',
                )

                if (nativeBalance) {
                    // Convert from wei to ETH
                    const ethAmount = parseFloat(nativeBalance.balance) / Math.pow(10, 18)
                    setBalance(ethAmount)
                }
            } catch (err) {
                console.error('Error fetching ETH balance:', err)
                setError(err instanceof Error ? err : new Error('Unknown error'))
                setBalance(0)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBalance()
    }, [walletAddress, chainId])

    // Check if balance is below threshold
    const chainConfig = chainId ? CHAINS_CONFIG[chainId] : null
    const threshold = chainConfig?.showTopUpBannerIfEthBalanceBelow || 0

    return {
        balance,
        isEthBalanceLoading: isLoading,
        error,
        isEthBelowThreshold: balance < threshold,
        threshold,
    }
}

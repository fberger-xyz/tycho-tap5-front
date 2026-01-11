import { NextResponse } from 'next/server'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { DebankToken } from '@/interfaces/debank.interface'
import { createCachedFunction } from '@/services/cache/shared-cache.service'
import { DebankService } from '@/services/debank.service'
import { logger } from '@/utils/logger.util'

// Create cached version with 5 minute TTL
const cachedFetchTokenList = createCachedFunction(
    (walletAddress: string, chainId: number, isAll: boolean) => {
        const debankChainId = DebankService.validateChain(chainId)
        return DebankService.fetchTokenList(walletAddress, debankChainId, isAll)
    },
    ['debank-token-list'],
    {
        revalidate: 300, // 5 minutes
        tags: ['debank'],
    },
)

export async function GET(request: Request): Promise<NextResponse> {
    const responseBody = {
        success: false,
        error: '',
        data: [] as DebankToken[],
    }

    try {
        // Extract and validate parameters
        const { searchParams } = new URL(request.url)
        const walletAddress = searchParams.get('walletAddress')
        const chainId = Number(searchParams.get('chainId'))
        const isAll = searchParams.get('isAll') !== 'false' // default true

        if (!walletAddress || !chainId) {
            responseBody.error = 'Missing required parameters: walletAddress, chainId'
            return NextResponse.json(responseBody, { status: 400 })
        }

        if (!Object.keys(CHAINS_CONFIG).map(Number).includes(Number(chainId))) {
            responseBody.error = `Invalid chainId. Supported chains: ${Object.keys(CHAINS_CONFIG).join(', ')}`
            return NextResponse.json(responseBody, { status: 400 })
        }

        // Use cached function to fetch data
        const tokens = await cachedFetchTokenList(walletAddress, chainId, isAll)

        responseBody.success = true
        responseBody.data = tokens

        // Add cache headers to inform clients
        return NextResponse.json(responseBody, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
        })
    } catch (error) {
        logger.error('Error fetching Debank token list', { error: String(error) })

        if (error instanceof Error && error.message.includes('not supported by Debank')) {
            responseBody.error = error.message
            return NextResponse.json(responseBody, { status: 400 })
        }

        responseBody.error = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(responseBody, { status: 500 })
    }
}

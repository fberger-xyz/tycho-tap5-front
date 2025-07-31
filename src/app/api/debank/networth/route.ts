import { NextResponse } from 'next/server'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { env } from '@/env/t3-env'
import { fetchWithTimeout } from '@/utils/requests.util'
import { DebankUserNetWorthUsd, DebankUserNetWorthUsdSnapshot } from '@/interfaces/debank.interface'

export async function GET(request: Request): Promise<NextResponse> {
    // debug
    const debug = true

    // prepare the response object
    const responseBody = {
        success: false,
        error: '',
        data: {
            networth: { usd_value: 0 } as DebankUserNetWorthUsd,
            debankLast24hNetWorth: [] as DebankUserNetWorthUsdSnapshot[],
        },
    }
    try {
        /**
         * 0. validate request
         */

        // Extract parameters from URL
        const { searchParams } = new URL(request.url)
        const walletAddress = searchParams.get('walletAddress')
        const chainId = Number(searchParams.get('chainId'))

        // Validate required parameters
        if (!walletAddress || !chainId) {
            responseBody.error = 'Missing required parameters: walletAddress, chainId'
            return NextResponse.json(responseBody, { status: 400 })
        }

        // Validate parameter values
        if (!Object.keys(CHAINS_CONFIG).map(Number).includes(Number(chainId))) {
            responseBody.error = `Invalid chainId. Supported chains: ${Object.keys(CHAINS_CONFIG).join(', ')}`
            return NextResponse.json(responseBody, { status: 400 })
        }

        /**
         * 1. debank - net worth
         */

        // Get Debank chain ID from chain config
        const chainConfig = CHAINS_CONFIG[chainId]
        if (!chainConfig || !chainConfig.debankId) {
            responseBody.error = `Chain ${chainId} not supported by Debank`
            return NextResponse.json(responseBody, { status: 400 })
        }
        const debankChainId = chainConfig.debankId

        // prepare request
        const url = `https://pro-openapi.debank.com/v1/user/chain_balance?id=${walletAddress}&chain_id=${debankChainId}`

        try {
            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', AccessKey: String(env.DEBANK_ACCESS_KEY) },
                cache: 'no-store',
                timeout: 60000, // 60 seconds timeout
                retries: 1, // Retry once on failure
            })

            // Parse response
            responseBody.data.networth = (await response.json()) as DebankUserNetWorthUsd
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`Debank chain_balance API error:`, errorMessage)
            responseBody.error = `Error fetching Debank balance data: ${errorMessage}`
            return NextResponse.json(responseBody, { status: 500 })
        }

        /**
         * 2. debank - 24-hour net curve on a single chain
         */

        // prepare request
        const netCurveUrl = `https://pro-openapi.debank.com/v1/user/chain_net_curve?id=${walletAddress}&chain_id=${debankChainId}`

        try {
            const response = await fetchWithTimeout(netCurveUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', AccessKey: String(env.DEBANK_ACCESS_KEY) },
                cache: 'no-store',
                timeout: 60000, // 60 seconds timeout
                retries: 1, // Retry once on failure
            })

            // Parse response
            responseBody.data.debankLast24hNetWorth = (await response.json()) as DebankUserNetWorthUsdSnapshot[]
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`Debank chain_net_curve API error:`, errorMessage)
            // Don't fail the whole request if net curve fails, just log the error
            console.warn('Continuing without 24h net worth data')
        }

        /**
         * 3. debug
         */

        if (debug) {
            console.log('debankChainId', debankChainId)
            console.log('walletAddress', walletAddress)
            console.log('networth', responseBody.data.networth)
        }

        /**
         * end
         */

        // set response
        responseBody.success = true
        return NextResponse.json(responseBody)
    } catch (error) {
        console.error('Error fetching Debank data:', error)
        responseBody.error = 'Internal server error'
        return NextResponse.json(responseBody, { status: 500 })
    }
}

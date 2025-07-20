'use client'

import { useState, useEffect, useCallback } from 'react'
import { TradeData } from '@/components/app/sections/activity/TradesTable'
import { TradeStatus } from '@/enums'

interface ApiTrade {
    id: string
    instanceId: string
    tokenInSymbol: string
    tokenInAmount: string
    tokenInValueUsd?: number
    tokenOutSymbol: string
    tokenOutAmount: string
    tokenOutValueUsd?: number
    protocol?: string
    poolAddress: string
    poolFee?: number
    status?: TradeStatus
    gasCost?: string
    gasCostUsd?: number
    netProfit?: number | null
    netProfitUsd?: number
    createdAt: string | Date
    transactionHash?: string
    Instance?: {
        chain: string
    }
}

interface ApiResponse {
    trades: ApiTrade[]
}

export function useTradesData(refreshInterval = 5000) {
    const [trades, setTrades] = useState<TradeData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const transformTrade = useCallback(
        (trade: ApiTrade): TradeData => ({
            id: trade.id,
            instanceId: trade.instanceId,
            chain: trade.Instance?.chain || 'ethereum',
            chainName: trade.Instance?.chain === 'ethereum' ? 'Ethereum' : 'Unichain',
            tokenIn: {
                symbol: trade.tokenInSymbol,
                amount: trade.tokenInAmount,
                valueUsd: trade.tokenInValueUsd,
            },
            tokenOut: {
                symbol: trade.tokenOutSymbol,
                amount: trade.tokenOutAmount,
                valueUsd: trade.tokenOutValueUsd,
            },
            pool: {
                protocol: trade.protocol || 'Unknown',
                address: trade.poolAddress,
                fee: trade.poolFee,
            },
            status: trade.status || TradeStatus.SUCCESS,
            gasCost: trade.gasCost
                ? {
                      amount: trade.gasCost,
                      valueUsd: trade.gasCostUsd,
                  }
                : undefined,
            netProfit:
                trade.netProfit !== null && trade.netProfit !== undefined
                    ? {
                          amount: trade.netProfit.toString(),
                          valueUsd: trade.netProfitUsd,
                      }
                    : undefined,
            timestamp: trade.createdAt,
            txHash: trade.transactionHash,
        }),
        [],
    )

    const fetchTrades = useCallback(async () => {
        try {
            setError(null)
            const response = await fetch('/api/trades?limit=100')

            if (!response.ok) {
                throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`)
            }

            const data: ApiResponse = await response.json()

            if (!data.trades || !Array.isArray(data.trades)) {
                throw new Error('Invalid API response format')
            }

            const transformedTrades = data.trades.map(transformTrade)
            setTrades(transformedTrades)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error occurred')
            console.error('Error fetching trades:', error)
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }, [transformTrade])

    useEffect(() => {
        fetchTrades()

        const interval = setInterval(fetchTrades, refreshInterval)

        return () => clearInterval(interval)
    }, [fetchTrades, refreshInterval])

    return { trades, isLoading, error, refetch: fetchTrades }
}

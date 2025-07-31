'use client'

import { useDebankData } from './useDebankData'

interface UseStrategyAUMParams {
    walletAddress?: string
    chainId?: number
}

export function useStrategyAUM({ walletAddress, chainId }: UseStrategyAUMParams) {
    const { networth, isLoading, error } = useDebankData({ walletAddress, chainId })
    
    return {
        aum: networth?.usd_value || 0,
        isLoading,
        error,
    }
}
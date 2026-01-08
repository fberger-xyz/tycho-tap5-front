'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ConfigurationWithInstances } from '@/types'
import { IS_DEV } from '@/config/app.config'

interface StrategiesState {
    // data
    strategies: ConfigurationWithInstances[]
    isLoading: boolean
    error: string | null
    lastFetch: number | null
    
    // actions
    setStrategies: (strategies: ConfigurationWithInstances[]) => void
    setLoading: (isLoading: boolean) => void
    setError: (error: string | null) => void
    
    // getters
    getStrategyById: (id: string) => ConfigurationWithInstances | undefined
    getStrategiesByChain: (chainId: number) => ConfigurationWithInstances[]
    getStrategiesByPair: (baseSymbol: string, quoteSymbol: string) => ConfigurationWithInstances[]
    getActiveStrategies: () => ConfigurationWithInstances[]
    
    // cache management
    isStale: (maxAge?: number) => boolean
    markFetched: () => void
    reset: () => void
}

const DEFAULT_STALE_TIME = 40000 // 40 seconds, matching react query

export const useStrategiesStore = create<StrategiesState>()(
    devtools(
        (set, get) => ({
            // initial state
            strategies: [],
            isLoading: false,
            error: null,
            lastFetch: null,
            
            // actions
            setStrategies: (strategies) => set({ strategies, error: null }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            
            // getters
            getStrategyById: (id) => {
                return get().strategies.find(s => s.id === id)
            },
            
            getStrategiesByChain: (chainId) => {
                return get().strategies.filter(s => s.chainId === chainId)
            },
            
            getStrategiesByPair: (baseSymbol, quoteSymbol) => {
                const base = baseSymbol.toLowerCase()
                const quote = quoteSymbol.toLowerCase()
                return get().strategies.filter(s => {
                    const stratBase = s.baseTokenSymbol.toLowerCase()
                    const stratQuote = s.quoteTokenSymbol.toLowerCase()
                    return (stratBase === base && stratQuote === quote) || 
                           (stratBase === quote && stratQuote === base)
                })
            },
            
            getActiveStrategies: () => {
                return get().strategies.filter(s => 
                    s.Instance.some(i => !i.endedAt)
                )
            },
            
            // cache management
            isStale: (maxAge = DEFAULT_STALE_TIME) => {
                const { lastFetch } = get()
                if (!lastFetch) return true
                return Date.now() - lastFetch > maxAge
            },
            
            markFetched: () => set({ lastFetch: Date.now() }),
            
            reset: () => set({
                strategies: [],
                isLoading: false,
                error: null,
                lastFetch: null,
            }),
        }),
        {
            name: 'strategies-store',
            enabled: IS_DEV,
        }
    )
)
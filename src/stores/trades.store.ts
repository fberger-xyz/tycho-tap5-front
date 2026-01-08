'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TradeWithInstanceAndConfiguration } from '@/types'
import { IS_DEV } from '@/config/app.config'

interface TradeFilters {
    configurationId?: string
    instanceId?: string
    chainId?: number
    minAmount?: number
    maxAmount?: number
    status?: 'success' | 'failed' | 'pending'
}

interface TradesState {
    // data - using Map for efficient lookups
    tradesById: Map<string, TradeWithInstanceAndConfiguration>
    tradeIdsByInstance: Map<string, Set<string>>
    tradeIdsByConfiguration: Map<string, Set<string>>
    isLoading: boolean
    error: string | null
    lastFetch: Map<string, number> // track last fetch time per query key
    
    // actions
    setTrades: (trades: TradeWithInstanceAndConfiguration[], queryKey: string) => void
    addTrade: (trade: TradeWithInstanceAndConfiguration) => void
    updateTrade: (tradeId: string, update: Partial<TradeWithInstanceAndConfiguration>) => void
    setLoading: (isLoading: boolean) => void
    setError: (error: string | null) => void
    
    // getters
    getTradeById: (id: string) => TradeWithInstanceAndConfiguration | undefined
    getTradesByInstance: (instanceId: string) => TradeWithInstanceAndConfiguration[]
    getTradesByConfiguration: (configurationId: string) => TradeWithInstanceAndConfiguration[]
    getRecentTrades: (limit?: number) => TradeWithInstanceAndConfiguration[]
    getTradesByFilters: (filters: TradeFilters) => TradeWithInstanceAndConfiguration[]
    
    // aggregations
    getTotalVolumeByInstance: (instanceId: string) => { tokenIn: number; tokenOut: number }
    getTradeCountByInstance: (instanceId: string) => number
    getSuccessRateByInstance: (instanceId: string) => number
    
    // cache management
    isStale: (queryKey: string, maxAge?: number) => boolean
    markFetched: (queryKey: string) => void
    reset: () => void
}

const DEFAULT_STALE_TIME = 5000 // 5 seconds, matching react query

export const useTradesStore = create<TradesState>()(
    devtools(
        (set, get) => ({
            // initial state
            tradesById: new Map(),
            tradeIdsByInstance: new Map(),
            tradeIdsByConfiguration: new Map(),
            isLoading: false,
            error: null,
            lastFetch: new Map(),
            
            // actions
            setTrades: (trades, queryKey) => {
                const tradesById = new Map(get().tradesById)
                const tradeIdsByInstance = new Map(get().tradeIdsByInstance)
                const tradeIdsByConfiguration = new Map(get().tradeIdsByConfiguration)
                
                // update maps
                trades.forEach(trade => {
                    tradesById.set(trade.id, trade)
                    
                    // update instance index
                    if (!tradeIdsByInstance.has(trade.instanceId)) {
                        tradeIdsByInstance.set(trade.instanceId, new Set())
                    }
                    tradeIdsByInstance.get(trade.instanceId)!.add(trade.id)
                    
                    // update configuration index
                    const configId = trade.Instance.configurationId
                    if (configId) {
                        if (!tradeIdsByConfiguration.has(configId)) {
                            tradeIdsByConfiguration.set(configId, new Set())
                        }
                        tradeIdsByConfiguration.get(configId)!.add(trade.id)
                    }
                })
                
                set({ 
                    tradesById, 
                    tradeIdsByInstance, 
                    tradeIdsByConfiguration,
                    error: null 
                })
                get().markFetched(queryKey)
            },
            
            addTrade: (trade) => {
                const tradesById = new Map(get().tradesById)
                const tradeIdsByInstance = new Map(get().tradeIdsByInstance)
                const tradeIdsByConfiguration = new Map(get().tradeIdsByConfiguration)
                
                tradesById.set(trade.id, trade)
                
                // update instance index
                if (!tradeIdsByInstance.has(trade.instanceId)) {
                    tradeIdsByInstance.set(trade.instanceId, new Set())
                }
                tradeIdsByInstance.get(trade.instanceId)!.add(trade.id)
                
                // update configuration index
                const configId = trade.Instance.configurationId
                if (configId) {
                    if (!tradeIdsByConfiguration.has(configId)) {
                        tradeIdsByConfiguration.set(configId, new Set())
                    }
                    tradeIdsByConfiguration.get(configId)!.add(trade.id)
                }
                
                set({ tradesById, tradeIdsByInstance, tradeIdsByConfiguration })
            },
            
            updateTrade: (tradeId, update) => {
                const tradesById = new Map(get().tradesById)
                const existing = tradesById.get(tradeId)
                if (existing) {
                    tradesById.set(tradeId, { ...existing, ...update })
                    set({ tradesById })
                }
            },
            
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            
            // getters
            getTradeById: (id) => {
                return get().tradesById.get(id)
            },
            
            getTradesByInstance: (instanceId) => {
                const { tradesById, tradeIdsByInstance } = get()
                const tradeIds = tradeIdsByInstance.get(instanceId)
                if (!tradeIds) return []
                
                return Array.from(tradeIds)
                    .map(id => tradesById.get(id))
                    .filter((t): t is TradeWithInstanceAndConfiguration => !!t)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            },
            
            getTradesByConfiguration: (configurationId) => {
                const { tradesById, tradeIdsByConfiguration } = get()
                const tradeIds = tradeIdsByConfiguration.get(configurationId)
                if (!tradeIds) return []
                
                return Array.from(tradeIds)
                    .map(id => tradesById.get(id))
                    .filter((t): t is TradeWithInstanceAndConfiguration => !!t)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            },
            
            getRecentTrades: (limit = 100) => {
                const trades = Array.from(get().tradesById.values())
                return trades
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, limit)
            },
            
            getTradesByFilters: (filters) => {
                let trades = Array.from(get().tradesById.values())
                
                if (filters.configurationId) {
                    trades = trades.filter(t => t.Instance.configurationId === filters.configurationId)
                }
                if (filters.instanceId) {
                    trades = trades.filter(t => t.instanceId === filters.instanceId)
                }
                if (filters.chainId) {
                    trades = trades.filter(t => t.Instance.Configuration?.chainId === filters.chainId)
                }
                // add more filters as needed
                
                return trades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            },
            
            // aggregations
            getTotalVolumeByInstance: (instanceId) => {
                const trades = get().getTradesByInstance(instanceId)
                return trades.reduce((acc, trade) => {
                    // extract amounts from trade.values JSON
                    const values = trade.values as { tokenInAmount?: number; tokenOutAmount?: number }
                    if (values?.tokenInAmount) {
                        acc.tokenIn += Number(values.tokenInAmount)
                    }
                    if (values?.tokenOutAmount) {
                        acc.tokenOut += Number(values.tokenOutAmount)
                    }
                    return acc
                }, { tokenIn: 0, tokenOut: 0 })
            },
            
            getTradeCountByInstance: (instanceId) => {
                return get().tradeIdsByInstance.get(instanceId)?.size || 0
            },
            
            getSuccessRateByInstance: (instanceId) => {
                const trades = get().getTradesByInstance(instanceId)
                if (!trades.length) return 0
                
                const successful = trades.filter(t => {
                    const values = t.values as { status?: string }
                    return values?.status === 'success'
                }).length
                
                return (successful / trades.length) * 100
            },
            
            // cache management
            isStale: (queryKey, maxAge = DEFAULT_STALE_TIME) => {
                const lastFetch = get().lastFetch.get(queryKey)
                if (!lastFetch) return true
                return Date.now() - lastFetch > maxAge
            },
            
            markFetched: (queryKey) => {
                const lastFetch = new Map(get().lastFetch)
                lastFetch.set(queryKey, Date.now())
                set({ lastFetch })
            },
            
            reset: () => set({
                tradesById: new Map(),
                tradeIdsByInstance: new Map(),
                tradeIdsByConfiguration: new Map(),
                isLoading: false,
                error: null,
                lastFetch: new Map(),
            }),
        }),
        {
            name: 'trades-store',
            enabled: IS_DEV,
        }
    )
)
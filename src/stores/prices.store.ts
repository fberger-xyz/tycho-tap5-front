'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { IS_DEV } from '@/config/app.config'

interface PriceData {
    id: string
    instanceId: string
    price: number
    timestamp: Date
}

interface PricesState {
    // data - organized by instance for quick lookups
    pricesByInstance: Map<string, PriceData[]>
    isLoading: Map<string, boolean> // loading state per instance
    error: Map<string, string | null> // error state per instance
    lastFetch: Map<string, number> // track last fetch time per instance
    
    // actions
    setPrices: (instanceId: string, prices: PriceData[]) => void
    addPrice: (instanceId: string, price: PriceData) => void
    setLoading: (instanceId: string, isLoading: boolean) => void
    setError: (instanceId: string, error: string | null) => void
    
    // getters
    getPricesByInstance: (instanceId: string) => PriceData[]
    getLatestPrice: (instanceId: string) => PriceData | undefined
    getPriceAtTime: (instanceId: string, timestamp: Date) => PriceData | undefined
    getPriceRange: (instanceId: string, from: Date, to: Date) => PriceData[]
    
    // calculations
    getPriceChange: (instanceId: string, hours: number) => { change: number; changePercent: number } | null
    getMovingAverage: (instanceId: string, periods: number) => number | null
    getVolatility: (instanceId: string, periods: number) => number | null
    
    // cache management
    isStale: (instanceId: string, maxAge?: number) => boolean
    markFetched: (instanceId: string) => void
    clearInstance: (instanceId: string) => void
    reset: () => void
}

const DEFAULT_STALE_TIME = 30000 // 30 seconds, matching react query

export const usePricesStore = create<PricesState>()(
    devtools(
        (set, get) => ({
            // initial state
            pricesByInstance: new Map(),
            isLoading: new Map(),
            error: new Map(),
            lastFetch: new Map(),
            
            // actions
            setPrices: (instanceId, prices) => {
                const pricesByInstance = new Map(get().pricesByInstance)
                // sort by timestamp for efficient lookups
                const sortedPrices = [...prices].sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
                pricesByInstance.set(instanceId, sortedPrices)
                
                const error = new Map(get().error)
                error.set(instanceId, null)
                
                set({ pricesByInstance, error })
                get().markFetched(instanceId)
            },
            
            addPrice: (instanceId, price) => {
                const pricesByInstance = new Map(get().pricesByInstance)
                const existing = pricesByInstance.get(instanceId) || []
                
                // insert in sorted order
                const newPrices = [...existing]
                const insertIndex = newPrices.findIndex(p => 
                    new Date(p.timestamp).getTime() > new Date(price.timestamp).getTime()
                )
                
                if (insertIndex === -1) {
                    newPrices.push(price)
                } else {
                    newPrices.splice(insertIndex, 0, price)
                }
                
                pricesByInstance.set(instanceId, newPrices)
                set({ pricesByInstance })
            },
            
            setLoading: (instanceId, isLoading) => {
                const loadingMap = new Map(get().isLoading)
                loadingMap.set(instanceId, isLoading)
                set({ isLoading: loadingMap })
            },
            
            setError: (instanceId, error) => {
                const errorMap = new Map(get().error)
                errorMap.set(instanceId, error)
                set({ error: errorMap })
            },
            
            // getters
            getPricesByInstance: (instanceId) => {
                return get().pricesByInstance.get(instanceId) || []
            },
            
            getLatestPrice: (instanceId) => {
                const prices = get().pricesByInstance.get(instanceId)
                return prices?.[prices.length - 1]
            },
            
            getPriceAtTime: (instanceId, timestamp) => {
                const prices = get().pricesByInstance.get(instanceId) || []
                const targetTime = new Date(timestamp).getTime()
                
                // find closest price to target timestamp
                let closest = prices[0]
                let minDiff = Math.abs(new Date(closest?.timestamp).getTime() - targetTime)
                
                for (const price of prices) {
                    const diff = Math.abs(new Date(price.timestamp).getTime() - targetTime)
                    if (diff < minDiff) {
                        minDiff = diff
                        closest = price
                    }
                }
                
                return closest
            },
            
            getPriceRange: (instanceId, from, to) => {
                const prices = get().pricesByInstance.get(instanceId) || []
                const fromTime = new Date(from).getTime()
                const toTime = new Date(to).getTime()
                
                return prices.filter(p => {
                    const time = new Date(p.timestamp).getTime()
                    return time >= fromTime && time <= toTime
                })
            },
            
            // calculations
            getPriceChange: (instanceId, hours) => {
                const prices = get().pricesByInstance.get(instanceId) || []
                if (prices.length < 2) return null
                
                const latest = prices[prices.length - 1]
                const targetTime = new Date(latest.timestamp).getTime() - (hours * 60 * 60 * 1000)
                
                // find price closest to target time
                const historicalPrice = get().getPriceAtTime(instanceId, new Date(targetTime))
                if (!historicalPrice) return null
                
                const change = latest.price - historicalPrice.price
                const changePercent = (change / historicalPrice.price) * 100
                
                return { change, changePercent }
            },
            
            getMovingAverage: (instanceId, periods) => {
                const prices = get().pricesByInstance.get(instanceId) || []
                if (prices.length < periods) return null
                
                const recentPrices = prices.slice(-periods)
                const sum = recentPrices.reduce((acc, p) => acc + p.price, 0)
                
                return sum / periods
            },
            
            getVolatility: (instanceId, periods) => {
                const prices = get().pricesByInstance.get(instanceId) || []
                if (prices.length < periods) return null
                
                const recentPrices = prices.slice(-periods).map(p => p.price)
                const mean = recentPrices.reduce((a, b) => a + b) / recentPrices.length
                
                const squaredDiffs = recentPrices.map(price => Math.pow(price - mean, 2))
                const variance = squaredDiffs.reduce((a, b) => a + b) / recentPrices.length
                
                return Math.sqrt(variance)
            },
            
            // cache management
            isStale: (instanceId, maxAge = DEFAULT_STALE_TIME) => {
                const lastFetch = get().lastFetch.get(instanceId)
                if (!lastFetch) return true
                return Date.now() - lastFetch > maxAge
            },
            
            markFetched: (instanceId) => {
                const lastFetch = new Map(get().lastFetch)
                lastFetch.set(instanceId, Date.now())
                set({ lastFetch })
            },
            
            clearInstance: (instanceId) => {
                const pricesByInstance = new Map(get().pricesByInstance)
                const isLoading = new Map(get().isLoading)
                const error = new Map(get().error)
                const lastFetch = new Map(get().lastFetch)
                
                pricesByInstance.delete(instanceId)
                isLoading.delete(instanceId)
                error.delete(instanceId)
                lastFetch.delete(instanceId)
                
                set({ pricesByInstance, isLoading, error, lastFetch })
            },
            
            reset: () => set({
                pricesByInstance: new Map(),
                isLoading: new Map(),
                error: new Map(),
                lastFetch: new Map(),
            }),
        }),
        {
            name: 'prices-store',
            enabled: IS_DEV,
        }
    )
)
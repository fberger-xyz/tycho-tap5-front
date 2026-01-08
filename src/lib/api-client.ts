import { AppUrls } from '@/enums'
import type { ConfigurationWithInstances, TradeWithInstanceAndConfiguration } from '@/types'
import { logger } from '@/utils/logger.util'

/**
 * Type-safe API client with consistent error handling
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

interface RequestOptions extends RequestInit {
    timeout?: number
    retries?: number
}

interface ApiResponse<T> {
    data?: T
    error?: string
    success: boolean
}

/**
 * Base fetch wrapper with timeout and error handling
 */
async function fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        })
        clearTimeout(timeoutId)
        return response
    } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408)
            }
            throw new ApiError(error.message)
        }
        throw new ApiError('Network error')
    }
}

/**
 * Generic API request handler
 */
async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetchWithTimeout(url, options)

    // Handle non-OK responses
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Network error')
        logger.error(`API Error (${response.status}):`, { error: errorText })

        // Try to parse error message from response
        let errorMessage = `Request failed: ${response.status} ${response.statusText}`
        try {
            const errorData = JSON.parse(errorText)
            if (errorData.error) {
                errorMessage = errorData.error
            }
        } catch {
            // Use default error message
        }

        throw new ApiError(errorMessage, response.status)
    }

    // Parse response
    const text = await response.text()
    if (!text) {
        throw new ApiError('Empty response from server')
    }

    try {
        return JSON.parse(text)
    } catch {
        throw new ApiError('Invalid JSON response from server')
    }
}

/**
 * API Client with methods for each endpoint
 */
export const apiClient = {
    // Strategies & Configurations
    strategies: {
        list: async (limit = 100, skip = 0): Promise<ConfigurationWithInstances[]> => {
            const response = (await apiRequest<ApiResponse<{ configurations?: ConfigurationWithInstances[] }>>(
                `${AppUrls.API_STRATEGIES}?limit=${limit}&skip=${skip}`,
            )) as { configurations?: ConfigurationWithInstances[] }
            if (!response.configurations || !Array.isArray(response.configurations)) {
                throw new ApiError('Invalid response format')
            }
            return response.configurations
        },
    },

    // Trades
    trades: {
        list: async (params: { limit?: number; configurationId?: string; instanceId?: string }): Promise<TradeWithInstanceAndConfiguration[]> => {
            const searchParams = new URLSearchParams()
            if (params.limit) searchParams.append('limit', params.limit.toString())
            if (params.configurationId) searchParams.append('configurationId', params.configurationId)
            if (params.instanceId) searchParams.append('instanceId', params.instanceId)

            const response = await apiRequest<{ trades: TradeWithInstanceAndConfiguration[] }>(`${AppUrls.API_TRADES}?${searchParams}`)
            if (!response.trades || !Array.isArray(response.trades)) {
                throw new ApiError('Invalid response format')
            }
            return response.trades
        },
    },

    // Prices
    prices: {
        byInstance: async (instanceId: string): Promise<{ id: string; instanceId: string; price: number; timestamp: Date }[]> => {
            if (!instanceId) return []
            const response = await apiRequest<
                | { prices?: { id: string; instanceId: string; price: number; timestamp: Date }[] }
                | { id: string; instanceId: string; price: number; timestamp: Date }[]
            >(`${AppUrls.API_PRICES}?instanceId=${encodeURIComponent(instanceId)}`)

            // Handle both response formats (array or object with prices property)
            if (Array.isArray(response)) {
                return response
            } else if (response?.prices && Array.isArray(response.prices)) {
                return response.prices
            }
            throw new ApiError('Invalid response format')
        },
    },

    // 1inch
    oneInch: {
        candles: async (params: { token0: string; token1: string; seconds: number; chainId: number }): Promise<{ data: unknown[] }> => {
            const searchParams = new URLSearchParams({
                token0: params.token0.toLowerCase(),
                token1: params.token1.toLowerCase(),
                seconds: params.seconds.toString(),
                chainId: params.chainId.toString(),
            })

            const response = await apiRequest<{ data: unknown[] }>(`/api/1inch/candles?${searchParams}`)
            if (!response.data || !Array.isArray(response.data)) {
                throw new ApiError('Invalid response format from 1inch API')
            }
            return response
        },
    },

    // Debank
    debank: {
        networth: async (walletAddress: string, chainId: number): Promise<{ networth: { usd_value: number }; debankLast24hNetWorth: unknown[] }> => {
            if (!walletAddress || !chainId) {
                return {
                    networth: { usd_value: 0 },
                    debankLast24hNetWorth: [],
                }
            }

            const response = await apiRequest<{
                success: boolean
                error?: string
                data: { networth: { usd_value: number }; debankLast24hNetWorth: unknown[] }
            }>(`${AppUrls.API_DEBANK}/networth?walletAddress=${encodeURIComponent(walletAddress)}&chainId=${chainId}`)
            if (!response.success) {
                throw new ApiError(response.error || 'Failed to fetch Debank data')
            }
            return response.data
        },

        tokenList: async (walletAddress: string, chainId: number, isAll = true): Promise<unknown[]> => {
            const params = new URLSearchParams({
                walletAddress: walletAddress || '',
                chainId: chainId?.toString() || '',
                isAll: isAll.toString(),
            })

            const response = await apiRequest<{ success: boolean; error?: string; data: unknown[] }>(`/api/debank/token-list?${params}`)
            if (!response.success) {
                throw new ApiError(response.error || 'Failed to fetch token list')
            }
            return response.data
        },
    },

    // Balances
    balances: {
        get: async (params: {
            walletAddress: string
            tokenAddresses: string[]
            chainId: number
            includeNative: boolean
        }): Promise<{ address: string; balance: string; decimals: number; symbol?: string }[]> => {
            const response = await apiRequest<{ balances: { address: string; balance: string; decimals: number; symbol?: string }[] }>(
                '/api/balances',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params),
                },
            )
            return response.balances || []
        },
    },

    // Dashboard
    dashboard: {
        get: async (): Promise<ConfigurationWithInstances[]> => {
            const response = await apiRequest<{ configurations?: ConfigurationWithInstances[] }>('/api/dashboard')
            if (!response.configurations || !Array.isArray(response.configurations)) {
                throw new ApiError('Invalid response format')
            }
            return response.configurations
        },
    },
}

/**
 * Helper to handle API errors consistently
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}

/**
 * Helper to get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.message
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'An unexpected error occurred'
}

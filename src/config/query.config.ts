/**
 * React Query configuration constants
 */

export const DEBANK_QUERY_CONFIG = {
    // Data is fresh for 30 minutes to minimize API calls
    staleTime: 30 * 60 * 1000,
    // Keep data in cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    refetchInterval: false as const,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, error: Error) => {
        // Don't retry on 4xx errors
        if (error.message.includes('4')) {
            return false
        }
        // Retry up to 2 times for other errors
        return failureCount < 2
    },
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 30000),
} as const

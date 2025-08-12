'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    // Create QueryClient instance per component to avoid SSR issues
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Network error retry configuration
                        retry: (failureCount, error) => {
                            // Don't retry on 4xx client errors
                            if (error instanceof Error && error.message.includes('4')) {
                                return false
                            }
                            // Retry up to 3 times with exponential backoff
                            return failureCount < 3
                        },
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                        // Don't refetch on window focus by default
                        refetchOnWindowFocus: false,
                        // Keep trying when offline
                        networkMode: 'offlineFirst',
                        // Keep cached data for 5 minutes
                        gcTime: 5 * 60 * 1000,
                        // Consider data stale after 30 seconds
                        staleTime: 30 * 1000,
                    },
                    mutations: {
                        // Mutation retry configuration
                        retry: 1,
                        networkMode: 'offlineFirst',
                    },
                },
            })
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const queryClient = new QueryClient({
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
        },
        mutations: {
            // Mutation retry configuration
            retry: 1,
            networkMode: 'offlineFirst',
        },
    },
})

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    return <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
}

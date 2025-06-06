'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const queryClient = new QueryClient()

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    return <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
    // return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

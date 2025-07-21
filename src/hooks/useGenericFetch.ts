'use client'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

interface UseFetchDataConfig<TData, TTransformed = TData> {
    queryKey: string[]
    endpoint: string
    transform?: (data: TData) => TTransformed
    enabled?: boolean
    refetchInterval?: number
    queryOptions?: Omit<UseQueryOptions<TTransformed, Error>, 'queryKey' | 'queryFn' | 'enabled' | 'refetchInterval'>
}

const DEFAULT_REFETCH_OPTIONS = {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
} as const

export function useFetchData<TData, TTransformed = TData>({
    queryKey,
    endpoint,
    transform,
    enabled = true,
    refetchInterval = 5000,
    queryOptions = {},
}: UseFetchDataConfig<TData, TTransformed>) {
    const { data, isLoading, error, refetch } = useQuery<TTransformed, Error>({
        queryKey,
        queryFn: async () => {
            const response = await fetch(endpoint)

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
            }

            const json: TData = await response.json()

            return transform ? transform(json) : (json as unknown as TTransformed)
        },
        enabled,
        refetchInterval,
        ...DEFAULT_REFETCH_OPTIONS,
        ...queryOptions,
    })

    return {
        data: data ?? ([] as unknown as TTransformed),
        isLoading,
        error,
        refetch,
    }
}

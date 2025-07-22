'use client'

import { useAppStore } from '@/stores/app.store'
import { StrategiesTable } from '@/components/app/strategies/StrategiesTable'
import { useConfigurations } from '@/hooks/fetchs/all/useConfigurations'

const TITLE = 'Strategies'

function ListStrategies() {
    const { isLoading, error, refetch, hasError, isRefetching } = useConfigurations()
    const { getStrategies } = useAppStore()
    const strategies = getStrategies()

    // Transform data for the table format

    // Show loading state only on initial load when we don't have data
    const showLoading = isLoading && strategies.length === 0

    // Show error state only when we have an error and no cached data
    if (hasError && error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load strategies'
        const isNetworkError = errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')

        return (
            <div className="w-full border border-red-200 bg-red-50 p-4 rounded-xl">
                <div className="flex flex-col gap-2">
                    <p className="text-red-600 text-sm font-medium">
                        {isNetworkError ? 'Unable to connect to the server' : 'Failed to load strategies'}
                    </p>
                    <p className="text-red-500 text-xs">
                        {isNetworkError
                            ? 'Please check your internet connection and try again.'
                            : 'The server encountered an error. Please try again later.'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {isRefetching ? 'Retrying...' : 'Try Again'}
                    </button>
                </div>
            </div>
        )
    }

    // Show data even if there's an error (cached data)
    return <StrategiesTable data={strategies} isLoading={showLoading} />
}

export default function StrategiesSection() {
    return (
        <div className="flex flex-col gap-5 mx-auto w-full max-w-[846px] mt-10">
            <p className="text-milk text-lg font-semibold">{TITLE}</p>
            <ListStrategies />
        </div>
    )
}

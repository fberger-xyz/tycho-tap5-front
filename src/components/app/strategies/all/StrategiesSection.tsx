'use client'

import { useStrategies } from '@/hooks/fetchs/all/useStrategies'
import { StrategyRow, LoadingStrategyRows } from '../all/StrategiesTable'

export default function StrategiesSection() {
    const { isLoading, error, refetch, hasError, isRefetching, strategies } = useStrategies()

    // error
    if (hasError && error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load strategies'
        const isNetworkError = errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')

        return (
            <div className="flex flex-col gap-5 mx-auto w-full max-w-[846px] mt-10">
                <p className="text-red-600 text-sm font-medium">{isNetworkError ? 'Unable to connect to the server' : 'Failed to load strategies'}</p>
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
        )
    }

    // easy ternary
    const showLoading = isLoading && strategies?.length === 0
    const noData = !isLoading && strategies?.length === 0

    return (
        <div className="flex flex-col gap-5 mx-auto w-full max-w-[846px]">
            <p className="text-milk text-lg font-semibold">Strategies</p>
            {showLoading ? (
                <LoadingStrategyRows />
            ) : noData ? (
                <div className="bg-milk-50 px-3 rounded-lg text-transparent flex items-center justify-center py-8">
                    <p className="m-auto text-folly">No instances</p>
                </div>
            ) : (
                strategies.map((strategy, strategyIndex) => (
                    <StrategyRow key={`${strategy.pair}-${strategyIndex}`} data={strategy} index={strategyIndex} />
                ))
            )}
        </div>
    )
}

'use client'

import PageWrapper from '@/components/common/PageWrapper'
import { useParams } from 'next/navigation'
import { useConfiguration } from '@/hooks/fetchs/useConfiguration'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import Skeleton from '@/components/ui/Skeleton'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { ErrorPlaceholder, NotFoundPlaceholder } from '@/components/app/shared/PlaceholderTemplates'

export default function StrategyPage() {
    const { strategy: strategyId } = useParams()
    const {
        configuration,
        instances,
        totalTradesCount,
        isLoading: configLoading,
        hasError: configHasError,
        error: configError,
    } = useConfiguration(strategyId || '')
    const {
        trades,
        isLoading: tradesLoading,
        hasError: tradesHasError,
        error: tradesError,
    } = useTradesData(5000, strategyId ? (Array.isArray(strategyId) ? strategyId[0] : strategyId) : undefined)

    if (!strategyId) return <NotFoundPlaceholder entryName="Strategy" />

    if (!configuration) return <NotFoundPlaceholder entryName="Configuration" />

    const isLoading = configLoading || tradesLoading
    const hasError = configHasError || tradesHasError

    if (isLoading || hasError) {
        return (
            <PageWrapper>
                <div className="space-y-4">
                    <Skeleton variant="text" className="h-8 w-64" />
                    <Skeleton variant="text" className="h-4 w-96" />
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mt-8">
                        <Skeleton variant="metric" className="h-24" />
                        <Skeleton variant="metric" className="h-24" />
                        <Skeleton variant="metric" className="h-24" />
                    </div>
                </div>
            </PageWrapper>
        )
    }

    if (hasError) {
        const errorMessage = configError?.message || tradesError?.message || 'An error occurred'
        return <ErrorPlaceholder entryName="Configuration" errorMessage={errorMessage} />
    }

    const chain = CHAINS_CONFIG[configuration!.chainId]

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-milk">
                        {configuration.baseTokenSymbol}/{configuration.quoteTokenSymbol} Strategy
                    </h1>
                    <p className="text-milk-400 mt-2">Running on {chain?.name || `Chain ${configuration.chainId}`}</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="bg-coal-800 rounded-lg p-4">
                        <p className="text-sm text-milk-400">Active Instances</p>
                        <p className="text-2xl font-semibold text-milk">{instances.filter((inst) => !inst.endedAt).length}</p>
                    </div>
                    <div className="bg-coal-800 rounded-lg p-4">
                        <p className="text-sm text-milk-400">Total Instances</p>
                        <p className="text-2xl font-semibold text-milk">{instances.length}</p>
                    </div>
                    <div className="bg-coal-800 rounded-lg p-4">
                        <p className="text-sm text-milk-400">Total Trades</p>
                        <p className="text-2xl font-semibold text-milk">{totalTradesCount}</p>
                    </div>
                </div>

                {/* Instances List */}
                <div>
                    <h2 className="text-lg font-semibold text-milk mb-4">Instances</h2>
                    <div className="space-y-2">
                        {instances.map((instance) => (
                            <div key={instance.id} className="bg-coal-800 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-milk-400">Instance ID</p>
                                        <p className="font-mono text-xs text-milk">{instance.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-milk-400">Trades</p>
                                        <p className="text-milk">{instance._count.Trade}</p>
                                    </div>
                                </div>
                                <div className="mt-2 flex gap-4 text-xs text-milk-400">
                                    <span>Started: {new Date(instance.startedAt).toLocaleDateString()}</span>
                                    {instance.endedAt && <span>Ended: {new Date(instance.endedAt).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trades */}
                <div>
                    <h2 className="text-lg font-semibold text-milk mb-4">Recent Trades</h2>
                    {trades.length > 0 ? (
                        <div className="space-y-2">
                            {trades.slice(0, 20).map((trade) => (
                                <div key={trade.id} className="bg-coal-800 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-milk-400">Trade ID</p>
                                            <p className="font-mono text-xs text-milk">{trade.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-milk-400">{new Date(trade.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {trades.length > 20 && <p className="text-center text-milk-400 text-sm py-2">Showing 20 of {trades.length} trades</p>}
                        </div>
                    ) : (
                        <p className="text-milk-400">No trades found for this configuration</p>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

'use client'

import { PoolsList } from '@/components/app/pools/PoolsList'
import RefreshCountdown from '@/components/app/pools/RefreshCountdown'
import { ErrorPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import StrategyTemplate from '@/components/app/strategies/strategy/StrategyTemplate'
import { StrategyTradesList } from '@/components/app/trades/strategy/StrategyTradesList'
import Card from '@/components/figma/Card'
import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import { useConfiguration } from '@/hooks/fetchs/useConfiguration'
import { useDebankData } from '@/hooks/fetchs/useDebankData'
import { useDebankTokenList } from '@/hooks/fetchs/useDebankTokenList'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import { useEthBalance } from '@/hooks/useEthBalance'
import { cn } from '@/utils'
import { jsonConfigParser } from '@/utils/data/parser'
import { getPriceSourceUrl } from '@/utils/price-source.util'
import { useParams } from 'next/navigation'
import { parseAsString, useQueryState } from 'nuqs'
import React, { lazy } from 'react'

// Lazy load heavy components
const ChartForPairOnChain = lazy(() => import('@/components/charts/ChartForPairOnChain'))

// Import smaller components
import StrategyConfiguration from '@/components/app/strategies/strategy/StrategyConfiguration'
import StrategyHeader from '@/components/app/strategies/strategy/StrategyHeader'
import StrategyInventory from '@/components/app/strategies/strategy/StrategyInventory'
import StrategyKPIs from '@/components/app/strategies/strategy/StrategyKPIs'

enum TradesView {
    RECENT_TRADES = 'Recent Trades',
    DEPOSITS_AND_WITHDRAWS = 'Deposits & Withdrawals',
}

const SKELETON_HEIGHTS = {
    CHART: 'h-[420px]',
    POOLS: 'h-[240px]',
    TRADES: 'h-48',
} as const

const MAX_WIDTH = 'max-w-[1400px]'

// Component for Pools with refresh countdown
function PoolsCard({
    chainId,
    token0,
    token1,
    targetSpreadBps,
    isInRange,
    referencePrice,
    isLoading,
}: {
    chainId?: number
    token0?: string
    token1?: string
    targetSpreadBps?: number
    isInRange?: boolean
    referencePrice?: number
    isLoading?: boolean
}) {
    const [refreshInterval, setRefreshInterval] = React.useState<number>()
    const [lastRefreshTime, setLastRefreshTime] = React.useState<number>()

    if (isLoading || !chainId || !token0 || !token1) {
        return <div className="skeleton-loading h-[240px] rounded-lg" />
    }

    return (
        <Card className="gap-5 px-0 pb-0">
            <div className="flex items-center justify-between px-5">
                <h1 className="font-inter-tight text-lg font-semibold text-milk">Pools Status</h1>
                <RefreshCountdown chainId={chainId} refreshIntervalMs={refreshInterval} lastRefreshTime={lastRefreshTime} />
            </div>
            <PoolsList
                chainId={chainId}
                token0={token0}
                token1={token1}
                isInRange={isInRange ?? true}
                targetSpreadBps={targetSpreadBps}
                referencePrice={referencePrice}
                onRefreshData={(interval, updatedAt) => {
                    setRefreshInterval(interval)
                    setLastRefreshTime(updatedAt)
                }}
            />
        </Card>
    )
}

export default function StrategyPage() {
    // params
    const { strategy: strategyId } = useParams()

    // trades view tab state with URL sync
    const [tradesTab, setTradesTab] = useQueryState('view', parseAsString.withDefault(TradesView.RECENT_TRADES))

    // State for live reference price from Binance
    const [liveReferencePrice, setLiveReferencePrice] = React.useState<number | undefined>()

    // Get configuration and strategy with price
    const { configuration, strategy, hasError: configHasError, error: configError } = useConfiguration(strategyId || '')

    // Get trades data with proper refresh interval
    const strategyIdStr = Array.isArray(strategyId) ? strategyId[0] : strategyId
    const { trades, isLoading: tradesLoading } = useTradesData(5000, strategyIdStr, 500)

    // Parse configuration
    const parsedConfig = configuration ? jsonConfigParser(configuration.id, configuration.values) : null

    // Extract wallet data for reuse
    const walletAddress = parsedConfig?.inventory.walletPublicKey || ''
    const chainId = parsedConfig?.chain.id || 0

    // Get debank data
    const { networth, debankLast24hNetWorth } = useDebankData({ walletAddress, chainId })

    // Get token list with same refresh interval as trades (5 seconds)
    const { tokens } = useDebankTokenList({
        walletAddress,
        chainId,
        isAll: false,
        refreshInterval: 5000,
    })

    // Get ETH balance for threshold checking
    const { isEthBalanceBelowThreshold } = useEthBalance({
        walletAddress,
        chainId,
    })

    // Get price from strategy data (already fetched by useStrategies hook)
    const priceUsd = strategy?.priceUsd || 0

    // Early returns for invalid state - progressive loading instead of full page skeleton
    if (!strategyId) {
        return (
            <HydratedPageWrapper className={MAX_WIDTH}>
                <div className="flex h-64 items-center justify-center">
                    <p className="text-milk-600">Invalid strategy ID</p>
                </div>
            </HydratedPageWrapper>
        )
    }

    // derived values
    const aum = debankLast24hNetWorth.length ? debankLast24hNetWorth[debankLast24hNetWorth.length - 1].usd_value : networth?.usd_value || 0

    // Get price source URL - use strategy if available for consistency
    const priceSourceUrl = strategy ? getPriceSourceUrl(strategy) : null

    // Handle errors
    if (configHasError) {
        return (
            <HydratedPageWrapper className={MAX_WIDTH}>
                <ErrorPlaceholder entryName="Configuration" errorMessage={configError?.message || 'Failed to load configuration'} />
            </HydratedPageWrapper>
        )
    }

    // Progressive loading - show skeleton for loading states
    const isInitialLoading = !configuration
    // const isInitialLoading = true

    // render
    return (
        <HydratedPageWrapper className={MAX_WIDTH}>
            <StrategyTemplate
                header={
                    <StrategyHeader
                        baseSymbol={parsedConfig?.base.symbol}
                        quoteSymbol={parsedConfig?.quote.symbol}
                        chainId={parsedConfig?.chain.id}
                        chainName={parsedConfig?.chain.name}
                        targetSpreadBps={parsedConfig?.execution.minSpreadThresholdBps}
                        isLoading={isInitialLoading}
                    />
                }
                banner={
                    !isInitialLoading &&
                    isEthBalanceBelowThreshold && (
                        <div className="w-full rounded-xl bg-folly/20 p-5">
                            <p className="text-folly">Out of range. Bot has run out of funds and can&apos;t operate until it&apos;s topped up.</p>
                        </div>
                    )
                }
                kpis={<StrategyKPIs aum={aum} priceUsd={priceUsd} priceSourceUrl={priceSourceUrl} isLoading={isInitialLoading} />}
                chart={
                    <Card className="h-[420px] p-0">
                        {isInitialLoading || !parsedConfig ? (
                            <div className="skeleton-loading h-full w-full rounded-xl" />
                        ) : (
                            <ChartForPairOnChain
                                baseTokenAddress={parsedConfig?.base.address}
                                quoteTokenAddress={parsedConfig?.quote.address}
                                baseTokenSymbol={parsedConfig?.base.symbol}
                                quoteTokenSymbol={parsedConfig?.quote.symbol}
                                chainId={parsedConfig?.chain.id}
                                targetSpreadBps={parsedConfig?.execution.minSpreadThresholdBps}
                                strategyId={strategyIdStr}
                                className="size-full"
                                onReferencePriceUpdate={setLiveReferencePrice}
                            />
                        )}
                    </Card>
                }
                pools={
                    null
                    // <PoolsCard
                    //     chainId={parsedConfig?.chain.id}
                    //     token0={parsedConfig?.base.address}
                    //     token1={parsedConfig?.quote.address}
                    //     targetSpreadBps={parsedConfig?.execution.minSpreadThresholdBps}
                    //     isInRange={!isEthBalanceBelowThreshold}
                    //     referencePrice={liveReferencePrice || priceUsd}
                    //     isLoading={isInitialLoading}
                    // />
                }
                trades={
                    isInitialLoading ? (
                        <div className={`skeleton-loading w-full ${SKELETON_HEIGHTS.TRADES} rounded-lg`} />
                    ) : (
                        <Card className="gap-5 px-0 pb-0">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 px-5">
                                <button className={cn('cursor-pointer')} onClick={() => setTradesTab(TradesView.RECENT_TRADES)}>
                                    <p
                                        className={cn('w-max truncate font-inter-tight text-lg font-semibold', {
                                            'text-milk': tradesTab === TradesView.RECENT_TRADES,
                                            'text-milk-400': tradesTab !== TradesView.RECENT_TRADES,
                                        })}
                                    >
                                        {TradesView.RECENT_TRADES}
                                    </p>
                                </button>
                                <button className={cn('cursor-pointer')} onClick={() => setTradesTab(TradesView.DEPOSITS_AND_WITHDRAWS)}>
                                    <p
                                        className={cn('w-max truncate font-inter-tight text-lg font-semibold', {
                                            'text-milk': tradesTab === TradesView.DEPOSITS_AND_WITHDRAWS,
                                            'text-milk-400': tradesTab !== TradesView.DEPOSITS_AND_WITHDRAWS,
                                        })}
                                    >
                                        {TradesView.DEPOSITS_AND_WITHDRAWS}
                                    </p>
                                </button>
                            </div>
                            {tradesTab === TradesView.RECENT_TRADES && <StrategyTradesList trades={trades || []} isLoading={tradesLoading} />}
                            {tradesTab === TradesView.DEPOSITS_AND_WITHDRAWS && (
                                <div className="w-full rounded-xl">
                                    <div className="w-full overflow-x-auto">
                                        <div className="flex max-h-[50vh] w-full min-w-max flex-col p-4">
                                            <p className="truncate text-milk-200">To be added</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )
                }
                inventory={
                    isInitialLoading ? (
                        <div className={`skeleton-loading w-full ${SKELETON_HEIGHTS.TRADES} rounded-lg`} />
                    ) : (
                        <StrategyInventory tokens={tokens} isLoading={isInitialLoading} />
                    )
                }
                configurations={
                    isInitialLoading ? (
                        <div className="skeleton-loading size-full rounded-lg" />
                    ) : parsedConfig ? (
                        <StrategyConfiguration parsedConfig={parsedConfig} priceSourceUrl={priceSourceUrl} trades={trades} />
                    ) : null
                }
            />
        </HydratedPageWrapper>
    )
}

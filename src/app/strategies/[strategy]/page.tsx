'use client'

import { Suspense, lazy } from 'react'
import { useParams } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { useConfiguration } from '@/hooks/fetchs/useConfiguration'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import { ErrorPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import StrategyTemplate from '@/components/app/strategies/strategy/StrategyTemplate'
import Card from '@/components/figma/Card'
import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import { jsonConfigParser } from '@/utils/data/parser'
import { useDebankData } from '@/hooks/fetchs/useDebankData'
import { useDebankTokenList } from '@/hooks/fetchs/useDebankTokenList'
import { cn } from '@/utils'
import { parseAsString, useQueryState } from 'nuqs'
import { StrategyTradesList } from '@/components/app/trades/strategy/StrategyTradesList'
import React from 'react'
import { getPriceSourceUrl } from '@/utils/price-source.util'
import { PoolsList } from '@/components/app/pools/PoolsList'
import RefreshCountdown from '@/components/app/pools/RefreshCountdown'
import { useEthBalance } from '@/hooks/useEthBalance'

// Lazy load heavy components
const ChartForPairOnChain = lazy(() => import('@/components/charts/ChartForPairOnChain'))

// Import smaller components
import StrategyHeader from '@/components/app/strategies/strategy/StrategyHeader'
import StrategyKPIs from '@/components/app/strategies/strategy/StrategyKPIs'
import StrategyInventory from '@/components/app/strategies/strategy/StrategyInventory'
import StrategyConfiguration from '@/components/app/strategies/strategy/StrategyConfiguration'

enum TradesView {
    RECENT_TRADES = 'Recent Trades',
}

const STRATEGY_UI_CONSTANTS = {
    // Layout
    MAX_WIDTH: 'max-w-[1400px]',

    // Sizes
    ICON_SIZES: {
        TOKEN: 20,
        CHAIN_SMALL: 18,
        CHAIN_MEDIUM: 20,
        DOUBLE_SYMBOL: 48,
    },

    // Heights for skeleton loading
    SKELETON_HEIGHTS: {
        KPI: 'h-[88px]',
        CHART: 'h-[420px]',
        POOLS: 'h-[240px]',
        CARD: 'h-[240px]',
        CONFIG: 'h-[320px]',
    },

    // Common class names
    CLASSES: {
        STAT_ROW: 'flex justify-between gap-4',
        STAT_LABEL: 'text-milk-600 truncate',
        STAT_VALUE: 'truncate',
    },

    // Default values
    DEFAULTS: {
        MAX_TRADES: 5000,
        TOKEN_DECIMALS: 4,
        PRICE_FORMAT: '0,0.[00]',
    },
} as const

// Constants moved to individual components

// Component for Pools with refresh countdown
function PoolsCard({ chainId, token0, token1, targetSpreadBps }: { chainId: number; token0: string; token1: string; targetSpreadBps?: number }) {
    const [refreshInterval, setRefreshInterval] = React.useState<number>()
    const [lastRefreshTime, setLastRefreshTime] = React.useState<number>()

    return (
        <Card className="gap-5 px-0 pb-0">
            <div className="flex items-center justify-between px-5">
                <h1 className="text-lg font-semibold text-milk font-inter-tight">Pools Status</h1>
                <RefreshCountdown chainId={chainId} refreshIntervalMs={refreshInterval} lastRefreshTime={lastRefreshTime} />
            </div>
            <PoolsList
                chainId={chainId}
                token0={token0}
                token1={token1}
                targetSpreadBps={targetSpreadBps}
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

    // Get configuration and strategy with price
    const { configuration, strategy, isLoading: configLoading, hasError: configHasError, error: configError } = useConfiguration(strategyId || '')

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

    // Get token list
    const { tokens } = useDebankTokenList({
        walletAddress,
        chainId,
        isAll: false,
    })

    // Get ETH balance for threshold checking
    const { isEthBalanceLoading, isEthBelowThreshold } = useEthBalance({
        walletAddress,
        chainId,
    })

    // Get price from strategy data (already fetched by useStrategies hook)
    const priceUsd = strategy?.priceUsd || 0

    // Early returns for invalid state - progressive loading instead of full page skeleton
    if (!strategyId) {
        return (
            <HydratedPageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
                <div className="flex items-center justify-center h-64">
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
            <ErrorBoundary
                fallback={<ErrorPlaceholder entryName="Configuration" errorMessage={configError?.message || 'Failed to load configuration'} />}
            >
                <ErrorPlaceholder entryName="Configuration" errorMessage={configError?.message || 'Failed to load configuration'} />
            </ErrorBoundary>
        )
    }

    // Progressive loading - show skeleton for loading states
    const isInitialLoading = configLoading && !configuration

    // render
    return (
        <HydratedPageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
            <StrategyTemplate
                header={
                    isInitialLoading ? (
                        <div className="skeleton-loading h-16 w-full rounded" />
                    ) : parsedConfig ? (
                        <StrategyHeader
                            baseSymbol={parsedConfig.base.symbol}
                            quoteSymbol={parsedConfig.quote.symbol}
                            chainId={parsedConfig.chain.id}
                            chainName={parsedConfig.chain.name}
                            targetSpread={parsedConfig.execution.minWatchSpreadBps}
                        />
                    ) : null
                }
                banner={
                    !isEthBalanceLoading &&
                    isEthBelowThreshold && (
                        <div className="w-full p-5 bg-folly/20 rounded-xl">
                            <p className="text-folly">Out of range. Bot has run out of funds and can&apos;t operate until it&apos;s topped up.</p>
                        </div>
                    )
                }
                kpis={
                    <ErrorBoundary fallback={<div className="text-red-500">Error loading KPIs</div>}>
                        <StrategyKPIs aum={aum} priceUsd={priceUsd} priceSourceUrl={priceSourceUrl} isLoading={isInitialLoading} />
                    </ErrorBoundary>
                }
                chart={
                    isInitialLoading ? (
                        <Card className="h-[420px] p-0">
                            <div className="skeleton-loading h-full w-full rounded" />
                        </Card>
                    ) : parsedConfig ? (
                        <ErrorBoundary
                            fallback={
                                <Card className="h-[420px] p-0">
                                    <div className="flex items-center justify-center h-full text-red-500">Error loading chart</div>
                                </Card>
                            }
                        >
                            <Suspense
                                fallback={
                                    <Card className="h-[420px] p-0">
                                        <div className="skeleton-loading h-full w-full rounded" />
                                    </Card>
                                }
                            >
                                <Card className="h-[420px] p-0">
                                    <ChartForPairOnChain
                                        baseTokenAddress={parsedConfig.base.address}
                                        quoteTokenAddress={parsedConfig.quote.address}
                                        baseTokenSymbol={parsedConfig.base.symbol}
                                        quoteTokenSymbol={parsedConfig.quote.symbol}
                                        chainId={parsedConfig.chain.id}
                                        targetSpreadBps={parsedConfig.execution.minSpreadThresholdBps}
                                        className="h-[420px] w-full"
                                    />
                                </Card>
                            </Suspense>
                        </ErrorBoundary>
                    ) : null
                }
                pools={
                    isInitialLoading ? (
                        <Card className="gap-5 px-0 pb-0">
                            <div className="skeleton-loading h-64 w-full rounded" />
                        </Card>
                    ) : parsedConfig ? (
                        <ErrorBoundary
                            fallback={
                                <Card className="gap-5 px-0 pb-0">
                                    <div className="p-5 text-red-500">Error loading pools</div>
                                </Card>
                            }
                        >
                            <PoolsCard
                                chainId={parsedConfig.chain.id}
                                token0={parsedConfig.base.address}
                                token1={parsedConfig.quote.address}
                                targetSpreadBps={parsedConfig.execution.minSpreadThresholdBps}
                            />
                        </ErrorBoundary>
                    ) : null
                }
                trades={
                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading trades</div>
                            </Card>
                        }
                    >
                        <Card className="gap-5 px-0 pb-0">
                            <div className="flex gap-x-6 gap-y-2 px-5 flex-wrap">
                                <button className={cn('cursor-pointer')} onClick={() => setTradesTab(TradesView.RECENT_TRADES)}>
                                    <p
                                        className={cn('text-lg truncate w-max font-inter-tight', {
                                            'text-milk font-semibold': tradesTab === TradesView.RECENT_TRADES,
                                            'text-milk-400': tradesTab !== TradesView.RECENT_TRADES,
                                        })}
                                    >
                                        {TradesView.RECENT_TRADES}
                                    </p>
                                </button>
                            </div>
                            {tradesTab === TradesView.RECENT_TRADES && <StrategyTradesList trades={trades || []} isLoading={tradesLoading} />}
                        </Card>
                    </ErrorBoundary>
                }
                inventory={
                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading inventory</div>
                            </Card>
                        }
                    >
                        <StrategyInventory tokens={tokens} isLoading={isInitialLoading} />
                    </ErrorBoundary>
                }
                configurations={
                    isInitialLoading ? (
                        <Card className="gap-5">
                            <div className="skeleton-loading h-96 w-full rounded" />
                        </Card>
                    ) : parsedConfig ? (
                        <ErrorBoundary
                            fallback={
                                <Card className="gap-5">
                                    <div className="p-5 text-red-500">Error loading configuration</div>
                                </Card>
                            }
                        >
                            <StrategyConfiguration parsedConfig={parsedConfig} priceSourceUrl={priceSourceUrl} trades={trades} />
                        </ErrorBoundary>
                    ) : null
                }
            />
        </HydratedPageWrapper>
    )
}

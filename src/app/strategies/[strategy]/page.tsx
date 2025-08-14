'use client'

import { lazy } from 'react'
import { useParams } from 'next/navigation'
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
    DEPOSITS_AND_WITHDRAWS = 'Deposits & Withdrawals',
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

// Component for Pools with refresh countdown
function PoolsCard({
    chainId,
    token0,
    token1,
    targetSpreadBps,
    isLoading,
}: {
    chainId?: number
    token0?: string
    token1?: string
    targetSpreadBps?: number
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
            <HydratedPageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
                <ErrorPlaceholder entryName="Configuration" errorMessage={configError?.message || 'Failed to load configuration'} />
            </HydratedPageWrapper>
        )
    }

    // Progressive loading - show skeleton for loading states
    const isInitialLoading = !configuration
    // const isInitialLoading = true

    // render
    return (
        <HydratedPageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
            <StrategyTemplate
                header={
                    <StrategyHeader
                        baseSymbol={parsedConfig?.base.symbol}
                        quoteSymbol={parsedConfig?.quote.symbol}
                        chainId={parsedConfig?.chain.id}
                        chainName={parsedConfig?.chain.name}
                        isLoading={isInitialLoading}
                    />
                }
                banner={
                    !isInitialLoading &&
                    isEthBalanceBelowThreshold && (
                        <div className="w-full p-5 bg-folly/20 rounded-xl">
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
                            />
                        )}
                    </Card>
                }
                pools={
                    <PoolsCard
                        chainId={parsedConfig?.chain.id}
                        token0={parsedConfig?.base.address}
                        token1={parsedConfig?.quote.address}
                        targetSpreadBps={parsedConfig?.execution.minSpreadThresholdBps}
                        isLoading={isInitialLoading}
                    />
                }
                trades={
                    isInitialLoading ? (
                        <div className="skeleton-loading w-full h-48 rounded-lg" />
                    ) : (
                        <Card className="gap-5 px-0 pb-0">
                            <div className="flex gap-x-6 gap-y-2 px-5 flex-wrap">
                                <button className={cn('cursor-pointer')} onClick={() => setTradesTab(TradesView.RECENT_TRADES)}>
                                    <p
                                        className={cn('text-lg truncate w-max font-semibold font-inter-tight', {
                                            'text-milk': tradesTab === TradesView.RECENT_TRADES,
                                            'text-milk-400': tradesTab !== TradesView.RECENT_TRADES,
                                        })}
                                    >
                                        {TradesView.RECENT_TRADES}
                                    </p>
                                </button>
                                <button className={cn('cursor-pointer')} onClick={() => setTradesTab(TradesView.DEPOSITS_AND_WITHDRAWS)}>
                                    <p
                                        className={cn('text-lg truncate w-max font-semibold font-inter-tight', {
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
                                <div className="rounded-xl w-full">
                                    <div className="overflow-x-auto w-full">
                                        <div className="flex flex-col min-w-max max-h-[50vh] w-full p-4">
                                            <p className="text-milk-200 truncate">To be added</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )
                }
                inventory={
                    isInitialLoading ? (
                        <div className="skeleton-loading w-full h-48 rounded-lg" />
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

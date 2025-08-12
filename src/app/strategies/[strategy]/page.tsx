'use client'

import PageWrapper from '@/components/common/PageWrapper'
import { useParams } from 'next/navigation'
import { useConfiguration } from '@/hooks/fetchs/useConfiguration'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import Skeleton from '@/components/common/Skeleton'
import { ErrorPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import StrategyTemplate from '@/components/app/strategies/strategy/StrategyTemplate'
import Card from '@/components/figma/Card'
import { ChainImage, DoubleSymbol, SymbolImage } from '@/components/common/ImageWrapper'
import { ButtonDark, ButtonDanger } from '@/components/figma/Button'
import { IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import { useRouter } from 'next/navigation'
import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import { jsonConfigParser } from '@/utils/data/parser'
import { TargetSpread } from '@/components/figma/Tags'
import { useDebankData } from '@/hooks/fetchs/useDebankData'
import { useDebankTokenList } from '@/hooks/fetchs/useDebankTokenList'
import UsdAmount from '@/components/figma/UsdAmount'
import { cn, shortenValue } from '@/utils'
import { parseAsString, useQueryState } from 'nuqs'
import { StrategyTradesList } from '@/components/app/trades/strategy/StrategyTradesList'
import ChartForPairOnChain from '@/components/charts/ChartForPairOnChain'
import { CHAINS_CONFIG } from '@/config/chains.config'
import LinkWrapper from '@/components/common/LinkWrapper'
import numeral from 'numeral'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import React, { ReactNode } from 'react'
import { getPriceSourceUrl } from '@/utils/price-source.util'
import { cleanOutput } from '@/utils/format.util'
import { PoolsList } from '@/components/app/pools/PoolsList'
import RefreshCountdown from '@/components/app/pools/RefreshCountdown'
import StyledTooltip from '@/components/common/StyledTooltip'
import { useEthBalance } from '@/hooks/useEthBalance'

enum TradesView {
    RECENT_TRADES = 'Recent Trades',
    DEPOSITS_WITHDRAWALS = 'Deposits & Withdrawals',
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

const STRATEGY_LABELS = {
    STATS: {
        RUNNING_TIME: 'Running time',
        CHAIN: 'Chain',
        LATEST_PRICE: 'Latest Price',
        TARGET_SPREAD: 'Target Spread',
        TOTAL_TRADES: 'Total trades',
        MAX_SLIPPAGE: 'Max Slippage',
        DAILY_GAS_BUDGET: 'Daily Gas Budget',
        PRICE_UPDATES: 'Price Updates',
        PRICE_FEED: 'Reference Price',
        EOA: 'EOA',
        BASE_TOKEN: 'Base Token',
        QUOTE_TOKEN: 'Quote Token',
        TX_GAS_LIMIT: 'Tx Gas Limit',
        POLL_INTERVAL: 'Poll Interval',
        BLOCK_OFFSET: 'Block Offset',
        PERMIT2: 'Permit2 Address',
        MIN_WATCH_SPREAD: 'Min Watch Spread',
        MIN_EXEC_SPREAD: 'Min Exec Spread',
        INCLUSION_BLOCK_DELAY: 'Inclusion Block Delay',
        MIN_PUBLISH_TIMEFRAME: 'Min Publish Timeframe',
        PUBLISH_EVENTS: 'Publish Events',
        GAS_TOKEN: 'Gas Token',
        MAX_INVENTORY_RATIO: 'Max Inventory Ratio',
        INFINITE_APPROVAL: 'Infinite Approval',
        SKIP_SIMULATION: 'Skip Simulation',
        TYCHO_ROUTER: 'Tycho Router',
    },
    PLACEHOLDERS: {
        NO_TOKENS: 'No tokens found',
        NO_DEPOSITS: 'No deposits or withdrawals',
        NOT_SET: 'Not set',
        UNKNOWN: 'Unknown',
    },
} as const

function StatRow({ label, explanation, value }: { label: string; explanation?: string; value: ReactNode }) {
    return (
        <div className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_ROW}>
            {explanation ? (
                <StyledTooltip content={explanation} className="max-w-xs">
                    <div className="flex gap-1 cursor-help">
                        <p className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_LABEL}>{label}</p>
                        <IconWrapper id={IconIds.INFORMATION} className="size-4 text-milk-400" />
                    </div>
                </StyledTooltip>
            ) : (
                <p className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_LABEL}>{label}</p>
            )}
            {typeof value === 'string' ? <p className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_VALUE}>{value}</p> : value}
        </div>
    )
}

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

const LoadingPage = ({ router }: { router: AppRouterInstance }) => {
    const { SKELETON_HEIGHTS } = STRATEGY_UI_CONSTANTS

    return (
        <PageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
            <StrategyTemplate
                header={
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:grow">
                            <ButtonDark onClick={() => router.back()} className="px-[9px] py-[9px] rounded-xl">
                                <IconWrapper id={IconIds.ARROW_LEFT} className="size-4" />
                            </ButtonDark>
                            <div className="flex gap-4 items-center w-80">
                                <DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={STRATEGY_UI_CONSTANTS.ICON_SIZES.DOUBLE_SYMBOL} gap={2} />
                                <div className="flex flex-col gap-1 grow items-start md:w-1/3">
                                    <Skeleton variant="text" className="w-3/4" />
                                    <Skeleton variant="text" className="w-2/3" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton variant="button" className="w-32" />
                            <Skeleton variant="button" className="w-12" />
                        </div>
                    </>
                }
                kpis={
                    <div className="grid grid-cols-3 gap-4">
                        <div className={`skeleton-loading ${SKELETON_HEIGHTS.KPI} rounded-lg w-full`} />
                        <div className={`skeleton-loading ${SKELETON_HEIGHTS.KPI} rounded-lg w-full`} />
                        <div className={`skeleton-loading ${SKELETON_HEIGHTS.KPI} rounded-lg w-full`} />
                    </div>
                }
                chart={<div className={`skeleton-loading ${SKELETON_HEIGHTS.CHART} w-full rounded-lg`} />}
                pools={<div className={`skeleton-loading ${SKELETON_HEIGHTS.POOLS} w-full rounded-lg`} />}
                trades={<div className={`skeleton-loading ${SKELETON_HEIGHTS.CARD} w-full rounded-lg`} />}
                inventory={<div className={`skeleton-loading ${SKELETON_HEIGHTS.CARD} w-full rounded-lg`} />}
                configurations={<div className={`skeleton-loading ${SKELETON_HEIGHTS.CONFIG} w-full rounded-lg`} />}
            />
        </PageWrapper>
    )
}

export default function StrategyPage() {
    const router = useRouter()

    // params
    const { strategy: strategyId } = useParams()

    // trades view tab state with URL sync
    const [tradesTab, setTradesTab] = useQueryState('view', parseAsString.withDefault(TradesView.RECENT_TRADES))

    // Get configuration and strategy with price
    const { configuration, strategy, isLoading: configLoading, hasError: configHasError, error: configError } = useConfiguration(strategyId || '')

    // Get trades data - disable automatic refetch (pass 0 as refreshInterval)
    const strategyIdStr = Array.isArray(strategyId) ? strategyId[0] : strategyId
    const { trades, isLoading: tradesLoading, hasError: tradesHasError, error: tradesError } = useTradesData(0, strategyIdStr) // Disabled refetch to prevent re-renders

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

    // Early returns for invalid state
    if (!strategyId || !configuration || !parsedConfig) return <LoadingPage router={router} />

    // derived values
    const aum = debankLast24hNetWorth.length ? debankLast24hNetWorth[debankLast24hNetWorth.length - 1].usd_value : networth?.usd_value || 0

    // Get price source URL - use strategy if available for consistency
    const priceSourceUrl = strategy ? getPriceSourceUrl(strategy) : null

    // Only show loading page during initial configuration load, not during refetches
    const isInitialLoading = configLoading && !configuration
    const hasError = configHasError || tradesHasError

    // loading or error - only check initial loading to prevent unmounting during refetches
    if (isInitialLoading) {
        return <LoadingPage router={router} />
    }

    // error
    if (hasError) {
        const errorMessage = configError?.message || tradesError?.message || 'An error occurred'
        return <ErrorPlaceholder entryName="Configuration" errorMessage={errorMessage} />
    }

    // render
    return (
        <HydratedPageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
            <StrategyTemplate
                header={
                    <>
                        {/* left */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-fit">
                            <ButtonDark onClick={() => router.back()} className="px-[9px] py-[9px] rounded-xl">
                                <IconWrapper id={IconIds.ARROW_LEFT} className="size-4" />
                            </ButtonDark>
                            <div className="flex gap-4 items-center">
                                <DoubleSymbol
                                    symbolLeft={parsedConfig.base.symbol}
                                    symbolRight={parsedConfig.quote.symbol}
                                    size={STRATEGY_UI_CONSTANTS.ICON_SIZES.DOUBLE_SYMBOL}
                                    gap={2}
                                />
                                <div className="flex flex-col gap-1 grow items-start md:w-1/3">
                                    <div className="flex gap-2 items-center">
                                        <p className="text-lg font-semibold truncate text-milk">
                                            {parsedConfig.base.symbol} / {parsedConfig.quote.symbol}
                                        </p>
                                        <div className="flex gap-0.5">
                                            <TargetSpread bpsAmount={parsedConfig.execution.minWatchSpreadBps ?? 0} rounded="rounded" />
                                            {/* <Range inRange={true} className="rounded-r" /> */}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <ChainImage id={parsedConfig.chain.id} size={20} />
                                        <p className="truncate text-milk-600 text-sm capitalize">{parsedConfig.chain.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* right */}
                        <div className="flex gap-2">
                            <StyledTooltip content="Coming soon: Control the market maker directly from your wallet">
                                <ButtonDanger className="w-max rounded-xl">
                                    <IconWrapper id={IconIds.STOP_TRADING} className="size-4" />
                                    <p className="text-sm truncate">Stop strategy</p>
                                </ButtonDanger>
                            </StyledTooltip>
                            <ButtonDark onClick={() => alert('To be implemented')} className="px-[10px] py-[7px] rounded-xl">
                                <IconWrapper id={IconIds.DOTS_HORIZONTAL} />
                            </ButtonDark>
                        </div>
                    </>
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
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <p className="text-xs text-milk-600">PnL</p>
                            {/* <Skeleton variant="text" /> */}
                            <p className="text-milk-200 truncate text-lg">To be computed</p>
                        </Card>
                        <Card>
                            <p className="text-xs text-milk-600">AUM</p>
                            {aum ? <UsdAmount amountUsd={aum} className="hover:underline" textClassName="text-lg" /> : <Skeleton variant="text" />}
                        </Card>
                        <Card>
                            <p className="text-xs text-milk-600">Price</p>
                            {priceSourceUrl ? (
                                <LinkWrapper href={priceSourceUrl} target="_blank">
                                    <UsdAmount amountUsd={priceUsd} className="hover:underline cursor-alias" textClassName="text-lg" />
                                </LinkWrapper>
                            ) : (
                                <UsdAmount amountUsd={priceUsd} textClassName="text-lg" />
                            )}
                        </Card>
                    </div>
                }
                chart={
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
                }
                pools={
                    <PoolsCard
                        chainId={parsedConfig.chain.id}
                        token0={parsedConfig.base.address}
                        token1={parsedConfig.quote.address}
                        targetSpreadBps={parsedConfig.execution.minSpreadThresholdBps}
                    />
                }
                trades={
                    <Card className="gap-5 px-0 pb-0">
                        <div className="flex gap-x-6 gap-y-2 px-5 flex-wrap">
                            {Object.values(TradesView).map((view) => (
                                <button key={view} className={cn('cursor-pointer')} onClick={() => setTradesTab(view)}>
                                    <p
                                        className={cn('text-lg truncate w-max font-inter-tight', {
                                            'text-milk font-semibold': view === tradesTab,
                                            'text-milk-400': view !== tradesTab,
                                        })}
                                    >
                                        {view}
                                    </p>
                                </button>
                            ))}
                        </div>
                        {tradesTab === TradesView.RECENT_TRADES && <StrategyTradesList trades={trades || []} isLoading={tradesLoading} />}
                        {tradesTab === TradesView.DEPOSITS_WITHDRAWALS && (
                            <div className="flex flex-col gap-3 text-sm px-5 pb-5">
                                <p className="text-milk-400">{STRATEGY_LABELS.PLACEHOLDERS.NO_DEPOSITS}</p>
                            </div>
                        )}
                    </Card>
                }
                inventory={
                    <Card className="gap-5 px-0 pb-0">
                        <div className="flex justify-between px-5 items-center">
                            <h1 className="text-lg font-semibold font-inter-tight">Your Funds</h1>
                            <StyledTooltip content="Coming soon: Manage your positions">
                                <ButtonDark
                                    onClick={() => {
                                        alert('Manage positions')
                                    }}
                                    className="px-[10px] py-[7px] rounded-xl"
                                >
                                    <p className="truncate text-sm">Manage</p>
                                </ButtonDark>
                            </StyledTooltip>
                        </div>
                        <div className="flex flex-col text-xs">
                            <div className="grid grid-cols-2 px-5 mb-3">
                                <p className="text-milk-600 truncate">Asset</p>
                                <p className="text-milk-600 truncate">Size</p>
                            </div>
                            {tokens.length === 0 ? (
                                <p className="text-milk-400 text-center py-4">{STRATEGY_LABELS.PLACEHOLDERS.NO_TOKENS}</p>
                            ) : (
                                tokens
                                    .filter((token) => token.price > 0.01)
                                    .sort((a, b) => b.amount - a.amount)
                                    .map((token) => (
                                        <div key={token.id} className="grid grid-cols-2 items-center border-t border-milk-100 py-3 px-5">
                                            <div className="flex items-center gap-2">
                                                <SymbolImage
                                                    symbol={token.optimized_symbol || token.symbol || '?'}
                                                    size={STRATEGY_UI_CONSTANTS.ICON_SIZES.TOKEN}
                                                />
                                                <p className="truncate">
                                                    {token.optimized_symbol || token.symbol || STRATEGY_LABELS.PLACEHOLDERS.UNKNOWN}
                                                </p>
                                            </div>
                                            <p className="truncate">
                                                {token.amount.toFixed(STRATEGY_UI_CONSTANTS.DEFAULTS.TOKEN_DECIMALS)}{' '}
                                                {token.price > 0 && (
                                                    <span className="text-xs text-milk-400 ml-2">
                                                        {cleanOutput(
                                                            `($${numeral(token.amount * token.price).format(STRATEGY_UI_CONSTANTS.DEFAULTS.PRICE_FORMAT)})`,
                                                        )}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    ))
                            )}
                        </div>
                    </Card>
                }
                configurations={
                    <Card className="gap-5">
                        <h1 className="text-lg font-semibold font-inter-tight">Configuration</h1>
                        <div className="flex flex-col gap-3 text-sm">
                            <StatRow
                                label={STRATEGY_LABELS.STATS.CHAIN}
                                value={
                                    <div className="flex items-center gap-2">
                                        <ChainImage id={parsedConfig.chain.id} size={STRATEGY_UI_CONSTANTS.ICON_SIZES.CHAIN_SMALL} />
                                        <p className="truncate capitalize">{CHAINS_CONFIG[parsedConfig.chain.id].name}</p>
                                    </div>
                                }
                            />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.BASE_TOKEN}
                                value={
                                    <LinkWrapper
                                        href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/token/${parsedConfig.base.address}`}
                                        className="truncate hover:underline cursor-alias"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {parsedConfig.base.symbol} ({shortenValue(parsedConfig.base.address)})
                                    </LinkWrapper>
                                }
                            />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.QUOTE_TOKEN}
                                value={
                                    <LinkWrapper
                                        href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/token/${parsedConfig.quote.address}`}
                                        className="truncate hover:underline cursor-alias"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {parsedConfig.quote.symbol} ({shortenValue(parsedConfig.quote.address)})
                                    </LinkWrapper>
                                }
                            />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.TARGET_SPREAD}
                                value={
                                    parsedConfig.execution.minSpreadThresholdBps
                                        ? `${parsedConfig.execution.minSpreadThresholdBps} bps`
                                        : STRATEGY_LABELS.PLACEHOLDERS.UNKNOWN
                                }
                            />
                            <StatRow label={STRATEGY_LABELS.STATS.TOTAL_TRADES} value={trades.length.toString()} />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.MAX_SLIPPAGE}
                                explanation="Maximum allowed slippage"
                                value={`${Math.round(parsedConfig.execution.maxSlippagePct * 10000) || 0} bps`}
                            />
                            <StatRow label={STRATEGY_LABELS.STATS.DAILY_GAS_BUDGET} value={STRATEGY_LABELS.PLACEHOLDERS.NOT_SET} />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.PRICE_FEED}
                                explanation="Price feed source type and data source URL"
                                value={
                                    <LinkWrapper
                                        href={strategy ? getPriceSourceUrl(strategy) || '' : ''}
                                        className="truncate capitalize hover:underline cursor-alias"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {parsedConfig.execution.priceFeedConfig.type || STRATEGY_LABELS.PLACEHOLDERS.UNKNOWN}
                                    </LinkWrapper>
                                }
                            />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.EOA}
                                explanation="Trading wallet public address"
                                value={
                                    <LinkWrapper
                                        href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/address/${walletAddress}`}
                                        className="truncate capitalize hover:underline cursor-alias"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {shortenValue(walletAddress)}
                                    </LinkWrapper>
                                }
                            />

                            {parsedConfig.execution.minWatchSpreadBps !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.MIN_WATCH_SPREAD}
                                    explanation="Minimum spread to trigger a trade (in basis points)"
                                    value={`${parsedConfig.execution.minWatchSpreadBps} bps`}
                                />
                            )}

                            {parsedConfig.execution.minExecSpreadBps !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.MIN_EXEC_SPREAD}
                                    explanation="Minimum profitability to execute trades (in basis points). The higher it is, the less frequent the opportunities are and the higher the revert rate"
                                    value={`${parsedConfig.execution.minExecSpreadBps} bps`}
                                />
                            )}

                            <StatRow
                                label={STRATEGY_LABELS.STATS.TX_GAS_LIMIT}
                                explanation="Maximum gas units per trade"
                                value={numeral(parsedConfig.execution.txGasLimit).format('0,0')}
                            />

                            <StatRow
                                label={STRATEGY_LABELS.STATS.POLL_INTERVAL}
                                explanation="Time between market data updates (to avoid rate limits)"
                                value={`${parsedConfig.execution.pollIntervalMs} ms`}
                            />

                            <StatRow
                                label={STRATEGY_LABELS.STATS.BLOCK_OFFSET}
                                explanation="Block number offset (for mainnet strategies)"
                                value={parsedConfig.execution.blockOffset.toString()}
                            />

                            {parsedConfig.execution.inclusionBlockDelay !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.INCLUSION_BLOCK_DELAY}
                                    explanation="Blocks to wait before confirming transaction"
                                    value={parsedConfig.execution.inclusionBlockDelay.toString()}
                                />
                            )}

                            {parsedConfig.execution.minPublishTimeframeMs !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.MIN_PUBLISH_TIMEFRAME}
                                    explanation="Minimum time between price event publications (to avoid rate limits)"
                                    value={`${parsedConfig.execution.minPublishTimeframeMs} ms`}
                                />
                            )}

                            {parsedConfig.execution.publishEvents !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.PUBLISH_EVENTS}
                                    explanation="Whether to save in DB the trading events (especially for UI)"
                                    value={parsedConfig.execution.publishEvents ? 'Yes' : 'No'}
                                />
                            )}

                            <StatRow
                                label={STRATEGY_LABELS.STATS.PERMIT2}
                                explanation="Permit2 contract for token approvals"
                                value={
                                    <LinkWrapper
                                        href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/address/${parsedConfig.tycho.permit2Address}`}
                                        className="truncate hover:underline cursor-alias"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {shortenValue(parsedConfig.tycho.permit2Address)}
                                    </LinkWrapper>
                                }
                            />

                            {parsedConfig.tycho.tychoRouterAddress && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.TYCHO_ROUTER}
                                    explanation="Tycho router contract address for execution"
                                    value={
                                        <LinkWrapper
                                            href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/address/${parsedConfig.tycho.tychoRouterAddress}`}
                                            className="truncate hover:underline cursor-alias"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {shortenValue(parsedConfig.tycho.tychoRouterAddress)}
                                        </LinkWrapper>
                                    }
                                />
                            )}

                            {parsedConfig.execution.gasTokenSymbol && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.GAS_TOKEN}
                                    explanation="Native token for transaction fees"
                                    value={shortenValue(parsedConfig.execution.gasTokenSymbol)}
                                />
                            )}

                            {parsedConfig.inventory.maxInventoryRatio !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.MAX_INVENTORY_RATIO}
                                    explanation="Maximum trade size relative to total inventory"
                                    value={`${(parsedConfig.inventory.maxInventoryRatio * 100).toFixed(1)}%`}
                                />
                            )}

                            {parsedConfig.tycho.infiniteApproval !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.INFINITE_APPROVAL}
                                    explanation="Permit2 approve infinite (base and quote)"
                                    value={parsedConfig.tycho.infiniteApproval ? 'Yes' : 'No'}
                                />
                            )}

                            {parsedConfig.execution.skipSimulation !== undefined && (
                                <StatRow
                                    label={STRATEGY_LABELS.STATS.SKIP_SIMULATION}
                                    explanation="Skip transaction simulation for speed (or if it's not possible)"
                                    value={parsedConfig.execution.skipSimulation ? 'Yes' : 'No'}
                                />
                            )}

                            {/* <StatRow
                                label={STRATEGY_LABELS.STATS.TYCHO_API}
                                explanation="Tycho protocol API endpoint (secret)"
                                value={<span className="text-xs font-mono">{parsedConfig.tycho.tychoApi}</span>}
                            /> */}
                        </div>
                    </Card>
                }
            />
        </HydratedPageWrapper>
    )
}

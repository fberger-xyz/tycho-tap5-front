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
import { Button, ButtonDanger } from '@/components/figma/Button'
import { IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import { useRouter } from 'next/navigation'
import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import { jsonConfigParser } from '@/utils/data/parser'
import { Range, TargetSpread } from '@/components/figma/Tags'
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
import { ReactNode } from 'react'

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
        CARD: 'h-[240px]',
        CONFIG: 'h-[320px]',
    },

    // Common class names
    CLASSES: {
        STAT_ROW: 'flex justify-between gap-4',
        STAT_LABEL: 'text-milk-400 truncate',
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
        PRICE_FEED: 'Price Feed',
        EOA: 'EOA',
    },
    PLACEHOLDERS: {
        NO_TOKENS: 'No tokens found',
        NO_DEPOSITS: 'No deposits or withdrawals',
        NOT_SET: 'Not set',
        UNKNOWN: 'Unknown',
        TO_BE_IMPLEMENTED: 'to be implemented',
    },
} as const

function StatRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_ROW}>
            <p className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_LABEL}>{label}</p>
            {typeof value === 'string' ? <p className={STRATEGY_UI_CONSTANTS.CLASSES.STAT_VALUE}>{value}</p> : value}
        </div>
    )
}

const LoadingPage = ({ router }: { router: AppRouterInstance }) => {
    const { SKELETON_HEIGHTS, ICON_SIZES } = STRATEGY_UI_CONSTANTS

    return (
        <PageWrapper className={STRATEGY_UI_CONSTANTS.MAX_WIDTH}>
            <StrategyTemplate
                header={
                    <>
                        <div className="flex items-center gap-4 w-full md:grow">
                            <Button onClick={() => router.back()}>
                                <IconWrapper id={IconIds.ARROW_LEFT} />
                            </Button>
                            <DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={ICON_SIZES.DOUBLE_SYMBOL} gap={2} />
                            <div className="flex flex-col gap-2 grow md:w-1/3">
                                <Skeleton variant="text" className="w-1/2" />
                                <Skeleton variant="text" className="w-1/2" />
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

    // Get configuration
    const { configuration, isLoading: configLoading, hasError: configHasError, error: configError } = useConfiguration(strategyId || '')

    // Get trades data
    const strategyIdStr = Array.isArray(strategyId) ? strategyId[0] : strategyId
    const {
        trades,
        isLoading: tradesLoading,
        hasError: tradesHasError,
        error: tradesError,
    } = useTradesData(STRATEGY_UI_CONSTANTS.DEFAULTS.MAX_TRADES, strategyIdStr)

    // Parse configuration
    const parsedConfig = configuration ? jsonConfigParser(configuration.id, configuration.values) : null

    // Extract wallet data for reuse
    const walletAddress = parsedConfig?.inventory.walletPublicKey || ''
    const chainId = parsedConfig?.chain.id || 0

    // Get debank data
    const { networth, debankLast24hNetWorth } = useDebankData({ walletAddress, chainId })

    // Get token list
    const { tokens, isLoading: tokensLoading } = useDebankTokenList({
        walletAddress,
        chainId,
        isAll: false,
    })

    // Early returns for invalid state
    if (!strategyId || !configuration || !parsedConfig) return <LoadingPage router={router} />

    // derived values
    const aum = debankLast24hNetWorth.length ? debankLast24hNetWorth[debankLast24hNetWorth.length - 1].usd_value : networth?.usd_value || 0

    // loading
    const isLoading = configLoading || tradesLoading || tokensLoading
    const hasError = configHasError || tradesHasError

    // loading or error
    if (isLoading) {
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
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:grow">
                            <Button onClick={() => router.back()}>
                                <IconWrapper id={IconIds.ARROW_LEFT} />
                            </Button>
                            <div className="flex gap-4 items-center">
                                <DoubleSymbol
                                    symbolLeft={parsedConfig.base.symbol}
                                    symbolRight={parsedConfig.quote.symbol}
                                    size={STRATEGY_UI_CONSTANTS.ICON_SIZES.DOUBLE_SYMBOL}
                                    gap={2}
                                />
                                <div className="flex flex-col gap-1 grow items-start md:w-1/3">
                                    <div className="flex gap-2 items-center">
                                        <p className="text-lg font-semibold truncate">
                                            {parsedConfig.base.symbol} / {parsedConfig.quote.symbol}
                                        </p>
                                        <div className="flex gap-0.5">
                                            <TargetSpread bpsAmount={parsedConfig.execution.minSpreadThresholdBps} />
                                            <Range inRange={true} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <ChainImage id={parsedConfig.chain.id} size={20} />
                                        <p className="truncate text-milk-400 text-sm capitalize">{parsedConfig.chain.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <ButtonDanger disabled>
                                <IconWrapper id={IconIds.STOP_TRADING} />
                                <p className="text-sm">Stop strategy</p>
                            </ButtonDanger>
                            <Button disabled>
                                <IconWrapper id={IconIds.DOTS_HORIZONTAL} />
                            </Button>
                        </div>
                    </>
                }
                kpis={
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <p className="text-sm text-milk-400">PnL</p>
                            <Skeleton variant="text" />
                        </Card>
                        <Card>
                            <p className="text-sm text-milk-400">AUM</p>
                            {aum ? <UsdAmount amountUsd={aum} className="hover:underline" /> : <Skeleton variant="text" />}
                        </Card>
                        <Card>
                            <p className="text-sm text-milk-400">Price</p>
                            <Skeleton variant="text" />
                        </Card>
                    </div>
                }
                chart={
                    <ChartForPairOnChain
                        baseTokenAddress={parsedConfig.base.address}
                        quoteTokenAddress={parsedConfig.quote.address}
                        chainId={parsedConfig.chain.id}
                        trades={trades || []}
                        className="h-[420px] w-full rounded-lg bg-milk-50"
                    />
                }
                trades={
                    <Card className="gap-5 px-0 pb-0">
                        <div className="flex gap-x-6 gap-y-2 px-5 flex-wrap">
                            {Object.values(TradesView).map((view) => (
                                <button key={view} className={cn('cursor-pointer')} onClick={() => setTradesTab(view)}>
                                    <p
                                        className={cn('text-lg truncate w-max', {
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
                        <h1 className="text-lg font-semibold px-5">Your positions</h1>
                        <div className="flex flex-col text-xs">
                            <div className="grid grid-cols-2 px-5 mb-3">
                                <p className="text-milk-400 truncate">Asset</p>
                                <p className="text-milk-400 truncate">Size</p>
                            </div>
                            {tokens.length === 0 ? (
                                <p className="text-milk-400 text-center py-4">{STRATEGY_LABELS.PLACEHOLDERS.NO_TOKENS}</p>
                            ) : (
                                tokens.map((token) => (
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
                                                    (${numeral(token.amount * token.price).format(STRATEGY_UI_CONSTANTS.DEFAULTS.PRICE_FORMAT)})
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
                        <h1 className="text-lg font-semibold">Stats</h1>
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
                                value={`${Math.round(parsedConfig.execution.maxSlippagePct * 10000) || 0} bps`}
                            />
                            <StatRow label={STRATEGY_LABELS.STATS.DAILY_GAS_BUDGET} value={STRATEGY_LABELS.PLACEHOLDERS.NOT_SET} />
                            <StatRow
                                label={STRATEGY_LABELS.STATS.PRICE_FEED}
                                value={
                                    <LinkWrapper
                                        href={parsedConfig.execution.priceFeedConfig.source}
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
                        </div>
                    </Card>
                }
            />
        </HydratedPageWrapper>
    )
}

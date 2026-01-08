'use client'

import { ReactNode } from 'react'
import { cn } from '@/utils'
import { memo } from 'react'
import { Strategy } from '@/types'
import { getPriceSourceUrl } from '@/utils/price-source.util'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { useStrategiesWithStore } from '@/hooks/stores/useStrategiesWithStore'
import { useDebankData } from '@/hooks/fetchs/useDebankData'
import { EmptyPlaceholder, ErrorPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import UsdAmount from '@/components/figma/UsdAmount'
import { TargetSpread } from '@/components/figma/Tags'
import DebankAumChart from '@/components/charts/DebankAumChart'
import Skeleton from '@/components/common/Skeleton'
import { DEFAULT_PADDING_X } from '@/config'
import { useEthBalance } from '@/hooks/useEthBalance'
import numeral from 'numeral'

/**
 * ------------------------ 1 template
 */

const StrategyHeaderTemplate = (props: {
    pairImages: ReactNode
    pairSymbols: ReactNode
    spread: ReactNode
    chains: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('center flex flex-row items-center gap-4', props.className)}>
            {props.pairImages}
            <div className="flex grow flex-col gap-2">
                {/* sub row 1 */}
                <div className="flex items-center gap-2">
                    {props.pairSymbols}
                    {props.spread}
                </div>

                {/* sub row 2 */}
                <div className="flex items-center gap-2">{props.chains}</div>
            </div>
        </div>
    )
}

const StrategyRowTemplate = (props: {
    header: ReactNode
    kpis: ReactNode
    chart?: ReactNode
    banner?: ReactNode
    className?: string
    headerLink?: string
}) => {
    const headerContent = (
        <>
            {props.header}
            {props.chart}
        </>
    )

    return (
        <div className={cn('flex w-full flex-col', props.className)}>
            {/* row 1 */}
            {props.headerLink ? (
                <LinkWrapper href={props.headerLink} className="block">
                    <div className="grid w-full cursor-pointer grid-cols-1 gap-y-4 overflow-hidden rounded-t-2xl bg-milk-50 px-4 py-5 transition-colors duration-200 hover:bg-milk-100 md:grid-cols-2">
                        {headerContent}
                    </div>
                </LinkWrapper>
            ) : (
                <div className="grid w-full cursor-pointer grid-cols-1 gap-y-4 overflow-hidden rounded-t-2xl bg-milk-50 p-4 transition-colors duration-200 hover:bg-milk-100 md:grid-cols-2">
                    {headerContent}
                </div>
            )}

            {/* separator */}
            <div className="w-full border-b border-milk-100" />

            {/* row 2 */}
            <div
                className={cn('grid grid-cols-2 items-center justify-between gap-6 bg-milk-50 p-5 md:grid-cols-4', !props.banner && 'rounded-b-2xl')}
            >
                {props.kpis}
            </div>

            {/* row 3 : banner */}
            {props.banner && <div className="w-full overflow-hidden rounded-b-2xl text-xs">{props.banner}</div>}
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

// none

/**
 * ------------------------ 3 loading
 */

function LoadingStrategyHeader() {
    const loadingParagraph = <Skeleton className="w-3/4" />
    return (
        <StrategyHeaderTemplate
            pairImages={<DoubleSymbol symbolLeft={undefined} symbolRight={undefined} size={48} gap={2} className="text-transparent" />}
            pairSymbols={loadingParagraph}
            spread={loadingParagraph}
            chains={loadingParagraph}
            className="cursor-wait"
        />
    )
}

export function LoadingStrategiesList() {
    return (
        <>
            {Array.from({ length: 2 }, (_, i) => (
                <StrategyRowTemplate
                    key={i}
                    header={<LoadingStrategyHeader />}
                    kpis={
                        <>
                            {Array.from({ length: 4 }, (_, i) => (
                                <div key={i} className="flex flex-col items-start gap-1">
                                    <Skeleton className="mb-1 w-1/2" />
                                    <Skeleton className="w-3/4" />
                                </div>
                            ))}
                        </>
                    }
                    chart={<div className="skeleton-loading h-14 w-full rounded-lg md:ml-auto md:w-48" />}
                    className="cursor-wait text-transparent"
                />
            ))}
        </>
    )
}

/**
 * ------------------------ 4 content
 */

export const StrategyId = ({ strategy, className }: { strategy: Strategy; className?: string }) => {
    return (
        <div className={cn('center flex flex-row items-center gap-4 p-4', className)}>
            <DoubleSymbol symbolLeft={strategy.base.symbol} symbolRight={strategy.quote.symbol} size={40} gap={2} />
            <p className="truncate text-2xl font-light">
                {strategy.base.symbol} / {strategy.quote.symbol}
            </p>
        </div>
    )
}

export const StrategyHeader = ({ data, className }: { data: Strategy; className?: string }) => {
    return (
        <StrategyHeaderTemplate
            pairImages={<DoubleSymbol symbolLeft={data.base.symbol} symbolRight={data.quote.symbol} size={48} gap={2} />}
            pairSymbols={
                <p className="truncate text-base font-semibold">
                    {data.base.symbol} / {data.quote.symbol}
                </p>
            }
            spread={
                <div className="flex gap-0.5">
                    <TargetSpread bpsAmount={data.config.execution.minWatchSpreadBps ?? 0} />
                    {/* <Range inRange={true} /> */}
                </div>
            }
            chains={
                <div className="flex items-center gap-2">
                    <ChainImage id={data.config.chain.id} size={18} />
                    <p className="truncate text-sm text-milk-600">{CHAINS_CONFIG[data.config.chain.id]?.name ?? 'unknown'}</p>
                </div>
            }
            className={className}
        />
    )
}

export const StrategyRow = memo(function StrategyRow({ data, index }: { data: Strategy; index: number }) {
    const walletAddress = data.config.inventory.walletPublicKey

    // Fetch AUM and 24h history for this specific strategy
    const { networth, debankLast24hNetWorth } = useDebankData({
        walletAddress,
        chainId: data.chainId,
    })
    const aum = debankLast24hNetWorth.length ? debankLast24hNetWorth[debankLast24hNetWorth.length - 1].usd_value : networth?.usd_value || 0

    // Check ETH balance threshold
    const { isEthBalanceLoading, isEthBalanceBelowThreshold } = useEthBalance({
        walletAddress,
        chainId: data.chainId,
    })

    // Extract USD values from the 24h history for the chart
    const chartData = debankLast24hNetWorth.length > 0 ? debankLast24hNetWorth.map((item) => item.usd_value) : [] // If no history, just show a flat line with current value

    // Get price source URL
    const priceSourceUrl = getPriceSourceUrl(data)

    return (
        <StrategyRowTemplate
            key={`${data.chainId}-${index}`}
            className="group"
            headerLink={`/strategies/${data.config.id}`}
            header={<StrategyHeader data={data} />}
            chart={
                <div className="h-14 md:ml-auto md:w-48">
                    {chartData.length > 0 ? <DebankAumChart data={chartData} className="size-full" /> : <Skeleton variant="debanAumChart" />}
                </div>
            }
            kpis={
                <>
                    {/* <div className="flex flex-col items-start gap-1">
                        <p className="truncate text-xs text-milk-600">PnL</p>
                        <p className="truncate text-milk-200">To be computed</p>
                    </div> */}
                    <LinkWrapper href={`https://debank.com/profile/${walletAddress}`} target="_blank" className="flex flex-col items-start gap-1">
                        <p className="truncate text-xs text-milk-600">AUM</p>
                        {aum ? <UsdAmount amountUsd={aum} className="cursor-alias hover:underline" /> : <Skeleton variant="text" />}
                    </LinkWrapper>
                    <div className="flex flex-col items-start gap-1">
                        <p className="truncate text-xs text-milk-600">Price</p>
                        {priceSourceUrl ? (
                            <LinkWrapper href={priceSourceUrl} target="_blank">
                                <UsdAmount amountUsd={data.priceUsd} className="cursor-alias hover:underline" />
                            </LinkWrapper>
                        ) : (
                            <UsdAmount amountUsd={data.priceUsd} />
                        )}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <p className="truncate text-xs text-milk-600">Trades</p>
                        <p className="truncate">
                            {numeral(data.instances.reduce((acc, instance) => acc + instance.value.trades.length, 0)).format('0,0')}
                        </p>
                    </div>
                </>
            }
            banner={
                !isEthBalanceLoading &&
                isEthBalanceBelowThreshold && (
                    <div className="w-full bg-folly/20 p-5">
                        <p className="text-folly">Out of range. Bot has run out of funds and can&apos;t operate until it&apos;s topped up.</p>
                    </div>
                )
            }
        />
    )
})

/**
 * ------------------------ 5 list
 */

export default function StrategiesList() {
    const { isLoading, error, refetch, hasError, isRefetching, strategies } = useStrategiesWithStore()

    // error
    if (hasError && error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load strategies'
        return (
            <div className={cn('mx-auto mt-10 flex w-full flex-col gap-5', DEFAULT_PADDING_X)}>
                <ErrorPlaceholder entryName="strategies" errorMessage={errorMessage} />
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="mt-2 rounded-lg bg-folly/20 px-4 py-2 text-sm font-medium text-folly disabled:cursor-not-allowed"
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
        <div className={cn('mx-auto flex w-full flex-col gap-5', DEFAULT_PADDING_X)}>
            {showLoading ? (
                <LoadingStrategiesList />
            ) : noData ? (
                <EmptyPlaceholder entryName="strategies" />
            ) : (
                strategies.map((strategy: Strategy, strategyIndex: number) => (
                    <StrategyRow key={`${strategy.chainId}-${strategyIndex}`} data={strategy} index={strategyIndex} />
                ))
            )}
        </div>
    )
}

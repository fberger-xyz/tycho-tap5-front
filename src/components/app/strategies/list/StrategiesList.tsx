'use client'

import { ReactNode } from 'react'
import { cn } from '@/utils'
import { memo } from 'react'
import { Strategy } from '@/types'
import { getPriceSourceUrl } from '@/utils/price-source.util'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { useStrategies } from '@/hooks/fetchs/useStrategies'
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
        <div className={cn('flex flex-row gap-4 center items-center', props.className)}>
            {props.pairImages}
            <div className="flex flex-col gap-2 grow">
                {/* sub row 1 */}
                <div className="flex gap-2 items-center">
                    {props.pairSymbols}
                    {props.spread}
                </div>

                {/* sub row 2 */}
                <div className="flex gap-2 items-center">{props.chains}</div>
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
        <div className={cn('w-full flex flex-col', props.className)}>
            {/* row 1 */}
            {props.headerLink ? (
                <LinkWrapper href={props.headerLink} className="block">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 w-full px-4 py-5 bg-milk-50 rounded-t-2xl hover:bg-milk-100 transition-colors duration-200 cursor-pointer overflow-hidden">
                        {headerContent}
                    </div>
                </LinkWrapper>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 w-full p-4 bg-milk-50 rounded-t-2xl hover:bg-milk-100 transition-colors duration-200 cursor-pointer overflow-hidden">
                    {headerContent}
                </div>
            )}

            {/* separator */}
            <div className="w-full border-b border-milk-100" />

            {/* row 2 */}
            <div
                className={cn('grid grid-cols-2 md:grid-cols-4 gap-6 justify-between items-center bg-milk-50 p-5', !props.banner && 'rounded-b-2xl')}
            >
                {props.kpis}
            </div>

            {/* row 3 : banner */}
            {props.banner && <div className="w-full rounded-b-2xl overflow-hidden text-xs">{props.banner}</div>}
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
            pairImages={<DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={48} gap={2} className="text-transparent" />}
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
                                <div key={i} className="flex flex-col gap-1 items-start">
                                    <Skeleton className="w-1/2 mb-1" />
                                    <Skeleton className="w-3/4" />
                                </div>
                            ))}
                        </>
                    }
                    chart={<div className="w-full md:w-48 h-14 md:ml-auto skeleton-loading rounded-lg" />}
                    className="text-transparent cursor-wait"
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
        <div className={cn('flex flex-row gap-4 center p-4 items-center', className)}>
            <DoubleSymbol symbolLeft={strategy.base.symbol} symbolRight={strategy.quote.symbol} size={40} gap={2} />
            <p className="truncate font-light text-2xl">
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
                <p className="truncate font-semibold text-base">
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
                <div className="flex gap-2 items-center">
                    <ChainImage id={data.config.chain.id} size={18} />
                    <p className="truncate text-milk-600 text-sm">{CHAINS_CONFIG[data.config.chain.id]?.name ?? 'unknown'}</p>
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
                <div className="md:w-48 h-14 md:ml-auto">
                    {chartData.length > 0 ? <DebankAumChart data={chartData} className="size-full" /> : <Skeleton variant="debanAumChart" />}
                </div>
            }
            kpis={
                <>
                    <div className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-600 text-xs">PnL</p>
                        <p className="text-milk-200 truncate">To be computed</p>
                    </div>
                    <LinkWrapper href={`https://debank.com/profile/${walletAddress}`} target="_blank" className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-600 text-xs">AUM</p>
                        {aum ? <UsdAmount amountUsd={aum} className="hover:underline cursor-alias" /> : <Skeleton variant="text" />}
                    </LinkWrapper>
                    <div className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-600 text-xs">Price</p>
                        {priceSourceUrl ? (
                            <LinkWrapper href={priceSourceUrl} target="_blank">
                                <UsdAmount amountUsd={data.priceUsd} className="hover:underline cursor-alias" />
                            </LinkWrapper>
                        ) : (
                            <UsdAmount amountUsd={data.priceUsd} />
                        )}
                    </div>

                    <div className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-600 text-xs">Trades</p>
                        <p className="truncate">
                            {numeral(data.instances.reduce((acc, instance) => acc + instance.value.trades.length, 0)).format('0,0')}
                        </p>
                    </div>
                </>
            }
            banner={
                !isEthBalanceLoading &&
                isEthBalanceBelowThreshold && (
                    <div className="w-full p-5 bg-folly/20">
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
    const { isLoading, error, refetch, hasError, isRefetching, strategies } = useStrategies()

    // error
    if (hasError && error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load strategies'
        return (
            <div className={cn('flex flex-col gap-5 mx-auto w-full mt-10', DEFAULT_PADDING_X)}>
                <ErrorPlaceholder entryName="strategies" errorMessage={errorMessage} />
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="mt-2 px-4 py-2 bg-folly/20 text-folly rounded-lg disabled:cursor-not-allowed text-sm font-medium"
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
        <div className={cn('flex flex-col gap-5 mx-auto w-full', DEFAULT_PADDING_X)}>
            {showLoading ? (
                <LoadingStrategiesList />
            ) : noData ? (
                <EmptyPlaceholder entryName="strategies" />
            ) : (
                strategies.map((strategy, strategyIndex) => (
                    <StrategyRow key={`${strategy.chainId}-${strategyIndex}`} data={strategy} index={strategyIndex} />
                ))
            )}
        </div>
    )
}

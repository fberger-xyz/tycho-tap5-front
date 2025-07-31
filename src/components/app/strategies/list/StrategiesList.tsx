'use client'

import { ReactNode } from 'react'
import { cn, getStrategyPair, shortenValue } from '@/utils'
import { memo } from 'react'
import { Strategy } from '@/types'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { useStrategies } from '@/hooks/fetchs/useStrategies'
import { useStrategyAUM } from '@/hooks/fetchs/useStrategyAUM'
import { EmptyPlaceholder, ErrorPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import UsdAmount from '@/components/figma/UsdAmount'
import MiniLineChart from '@/components/charts/MiniLineChart'
import { Range, TargetSpread } from '@/components/figma/Tags'

/**
 * ------------------------ 1 template
 */

export const StrategyHeaderTemplate = (props: {
    pairImages: ReactNode
    pairSymbols: ReactNode
    spread: ReactNode
    chains: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('flex flex-row gap-4 center items-center', props.className)}>
            {props.pairImages}
            <div className="flex flex-col gap-2">
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

export const StrategyRowTemplate = (props: { header: ReactNode; kpis: ReactNode; chart?: ReactNode; className?: string }) => {
    return (
        <div className={cn('w-full flex flex-col', props.className)}>
            {/* row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full p-4 bg-milk-50 rounded-t-2xl group-hover:bg-milk-200 transition-colors duration-200 cursor-pointer">
                {props.header}
                {props.chart}
            </div>

            {/* row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-between items-center bg-milk-100 p-5 rounded-b-2xl">{props.kpis}</div>
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

export function LoadingStrategyHeader() {
    const loadingClass = 'w-3/4 skeleton-loading h-6 rounded-lg'
    const loadingParagraph = <p className={loadingClass}>Loading...</p>
    return (
        <StrategyHeaderTemplate
            pairImages={<DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={48} gap={2} className="text-transparent" />}
            pairSymbols={loadingParagraph}
            spread={loadingParagraph}
            chains={loadingParagraph}
            className="text-transparent"
        />
    )
}

export function LoadingStrategiesList() {
    const loadingClass = 'w-3/4 skeleton-loading h-6 rounded-lg'
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
                                    <p className={loadingClass}>Metric {i + 1}</p>
                                    <p className={loadingClass}>Todo</p>
                                </div>
                            ))}
                        </>
                    }
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
                    <TargetSpread bpsAmount={0} />
                    <Range inRange={true} />
                </div>
            }
            chains={
                <div className="flex gap-2 items-center">
                    <ChainImage id={data.config.chain.id} size={18} />
                    <p className="truncate text-milk-400 text-sm">{CHAINS_CONFIG[data.config.chain.id]?.name ?? 'unknown'}</p>
                </div>
            }
            className={className}
        />
    )
}

export const StrategyRow = memo(function StrategyRow({ data, index }: { data: Strategy; index: number }) {
    // Generate sample data for the chart (replace with real data when available)
    const mockChartData = [20, 35, 30, 45, 40, 55, 50, 65, 60, 70, 68, 75]
    const walletAddress = data.config.inventory.walletPublicKey

    // Fetch AUM for this specific strategy
    const { aum } = useStrategyAUM({
        walletAddress,
        chainId: data.chainId,
    })

    return (
        <StrategyRowTemplate
            key={`${data.chainId}-${index}`}
            className="group"
            header={
                <LinkWrapper href={`/strategies/${getStrategyPair(data)}`}>
                    <StrategyHeader data={data} />
                </LinkWrapper>
            }
            chart={
                <div className="w-full md:w-44 h-14 md:ml-auto">
                    <MiniLineChart data={mockChartData} className="size-full" />
                </div>
            }
            kpis={
                <>
                    <div className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-400 text-sm">PnL</p>
                        <UsdAmount amountUsd={8234.56} variationPercentage={0.0702} />
                    </div>
                    <LinkWrapper
                        href={`https://debank.com/profile/${walletAddress}`}
                        target="_blank"
                        className="group flex flex-col gap-1 items-start group cursor-alias"
                    >
                        <p className="truncate text-milk-400 text-sm">AUM {shortenValue(walletAddress)}</p>
                        <UsdAmount amountUsd={aum} className="group-hover:underline" />
                    </LinkWrapper>
                    <div className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-400 text-sm">Price</p>
                        <UsdAmount amountUsd={data.priceUsd} />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                        <p className="truncate text-milk-400 text-sm">Trades</p>
                        <p className="truncate">{data.tradesCount}</p>
                    </div>
                </>
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
            <div className="flex flex-col gap-5 mx-auto w-full mt-10">
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
        <div className="flex flex-col gap-5 mx-auto w-full">
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

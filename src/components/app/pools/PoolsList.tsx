'use client'

import React, { ReactNode } from 'react'
import { usePoolsData } from '@/hooks/fetchs/usePoolsData'
import { cn, DAYJS_FORMATS, mapProtocolIdToProtocolConfig } from '@/utils'
import { EmptyPlaceholder } from '../shared/PlaceholderTemplates'
import numeral from 'numeral'
import { AmmPool } from '@/interfaces'
import FileMapper from '@/components/icons/FileMapper'
import { getProtocolConfig, CHAINS_CONFIG } from '@/config'
import StyledTooltip from '@/components/common/StyledTooltip'
import { LiveDate } from '@/components/common/LiveDate'
import PoolLink from './LinkToPool'
import { AppSupportedChainIds } from '@/enums'
import { DoubleSymbol, SymbolImage } from '@/components/common/ImageWrapper'
import { Range } from '@/components/figma/Tags'

// todo simulation failed pas de broadcast data

/**
 * Helper function to calculate if a pool is within the target spread range
 */
function calculatePoolInRange(
    poolPrice: number,
    referencePrice: number | undefined,
    targetSpreadBps: number | undefined,
    defaultInRange: boolean,
): boolean {
    // Use default if we don't have the necessary data
    if (!referencePrice || !targetSpreadBps || poolPrice <= 0) {
        return defaultInRange
    }

    const spreadDecimal = targetSpreadBps / 10000
    const lowerBound = referencePrice * (1 - spreadDecimal)
    const upperBound = referencePrice * (1 + spreadDecimal)

    return poolPrice >= lowerBound && poolPrice <= upperBound
}

/**
 * ------------------------ 1 template
 */

export const PoolRowTemplate = (props: {
    protocol: ReactNode
    range: ReactNode
    poolPrice: ReactNode
    lastUpdate: ReactNode
    base: {
        balance: ReactNode
        usd: ReactNode
        percent: ReactNode
    }
    quote: {
        balance: ReactNode
        usd: ReactNode
        percent: ReactNode
    }
    tvlUsd: ReactNode
    tvlPercent: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('grid w-full grid-cols-9 items-center gap-4 px-4 text-sm', props.className)}>
            <div className="col-span-1">{props.protocol}</div>
            <div className="col-span-1">{props.range}</div>
            <div className="col-span-1">{props.poolPrice}</div>
            <div className="col-span-1">{props.lastUpdate}</div>

            {/* Base token columns */}
            <div className="col-span-2 grid w-full grid-cols-3">
                <div className="col-span-1 text-right">{props.base.balance}</div>
                <div className="col-span-1 text-right">{props.base.usd}</div>
                <div className="col-span-1 text-right">{props.base.percent}</div>
            </div>

            {/* Quote token columns */}
            <div className="col-span-2 grid w-full grid-cols-3">
                <div className="col-span-1 text-right">{props.quote.balance}</div>
                <div className="col-span-1 text-right">{props.quote.usd}</div>
                <div className="col-span-1 text-right">{props.quote.percent}</div>
            </div>

            {/* TVL columns */}
            <div className="col-span-1 grid w-full grid-cols-2">
                <div className="col-span-1 text-right">{props.tvlUsd}</div>
                <div className="col-span-1 text-right">{props.tvlPercent}</div>
            </div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function PoolsTableHeaders({ baseSymbol = 'Base', quoteSymbol = 'Quote' }: { baseSymbol?: string; quoteSymbol?: string }) {
    return (
        <div className="grid w-full grid-cols-9 items-end gap-3 px-4 pb-2 text-xs text-milk-400">
            <div className="col-span-1">Protocol</div>
            <div className="col-span-1">Range</div>
            <div className="col-span-1">Pool price</div>
            <div className="col-span-1">Last trade</div>

            {/* Base token columns */}
            <div className="col-span-2 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 border-b border-milk-100 pb-1 text-center font-semibold text-milk">
                    <SymbolImage symbol={baseSymbol} size={20} />
                    <p className="truncate">{baseSymbol}</p>
                </div>
                <div className="col-span-3 grid w-full grid-cols-3">
                    <div className="col-span-1 text-right">Balance</div>
                    <div className="col-span-1 text-right">k$</div>
                    <div className="col-span-1 text-right">%</div>
                </div>
            </div>

            {/* Quote token columns */}
            <div className="col-span-2 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 border-b border-milk-100 pb-1 text-center font-semibold text-milk">
                    <SymbolImage symbol={quoteSymbol} size={20} />
                    <p className="truncate">{quoteSymbol}</p>
                </div>
                <div className="grid w-full grid-cols-3">
                    <div className="col-span-1 text-right">Balance</div>
                    <div className="col-span-1 text-right">k$</div>
                    <div className="col-span-1 text-right">%</div>
                </div>
            </div>

            {/* TVL columns */}
            <div className="col-span-1 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 border-b border-milk-100 pb-1 text-center font-semibold text-milk">
                    <DoubleSymbol symbolLeft={baseSymbol} symbolRight={quoteSymbol} size={20} gap={1} />
                    <p className="truncate">TVL</p>
                </div>
                <div className="grid w-full grid-cols-2">
                    <div className="col-span-1 text-right">k$</div>
                    <div className="col-span-1 text-right">%</div>
                </div>
            </div>
        </div>
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingPoolsRows() {
    const loadingParagraph = <p className="skeleton-loading mr-auto h-6 w-3/4 rounded-lg">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 pb-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <PoolRowTemplate
                        key={i}
                        protocol={loadingParagraph}
                        range={loadingParagraph}
                        poolPrice={loadingParagraph}
                        lastUpdate={loadingParagraph}
                        base={{
                            balance: loadingParagraph,
                            usd: loadingParagraph,
                            percent: loadingParagraph,
                        }}
                        quote={{
                            balance: loadingParagraph,
                            usd: loadingParagraph,
                            percent: loadingParagraph,
                        }}
                        tvlUsd={loadingParagraph}
                        tvlPercent={loadingParagraph}
                        className="rounded-lg border-b border-milk-50 py-2 text-transparent"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * ------------------------ 4 content
 */

// Type for PoolRow props
type PoolRowProps = {
    pool: AmmPool
    poolPrice?: number
    baseSymbol?: string
    quoteSymbol?: string
    isInRange?: boolean
    baseLiquidity?: number
    quoteLiquidity?: number
    ethUsd?: number
    baseWorthEth?: number
    quoteWorthEth?: number
    totalBaseLiquidity?: number
    totalQuoteLiquidity?: number
    chainId?: number
    className?: string
}

// Removed memo for now to ensure updates happen
export const PoolRow = function PoolRow({
    pool,
    poolPrice,
    isInRange,
    baseSymbol,
    quoteSymbol,
    baseLiquidity,
    quoteLiquidity,
    ethUsd,
    baseWorthEth,
    quoteWorthEth,
    totalBaseLiquidity,
    totalQuoteLiquidity,
    chainId,
    className,
}: PoolRowProps) {
    // Calculate USD values
    const baseUsd = (baseLiquidity || 0) * (baseWorthEth || 0) * (ethUsd || 0)
    const quoteUsd = (quoteLiquidity || 0) * (quoteWorthEth || 0) * (ethUsd || 0)
    const totalBaseUsd = (totalBaseLiquidity || 0) * (baseWorthEth || 0) * (ethUsd || 0)
    const totalQuoteUsd = (totalQuoteLiquidity || 0) * (quoteWorthEth || 0) * (ethUsd || 0)
    const poolTvlUsd = baseUsd + quoteUsd
    const totalTvlUsd = totalBaseUsd + totalQuoteUsd

    // Calculate percentages
    const basePercent = totalBaseLiquidity && totalBaseLiquidity > 0 ? ((baseLiquidity || 0) / totalBaseLiquidity) * 100 : 0
    const quotePercent = totalQuoteLiquidity && totalQuoteLiquidity > 0 ? ((quoteLiquidity || 0) / totalQuoteLiquidity) * 100 : 0
    const tvlPercent = totalTvlUsd > 0 ? (poolTvlUsd / totalTvlUsd) * 100 : 0

    // Get protocol config for PoolLink
    const protocolConfig = mapProtocolIdToProtocolConfig(pool.protocol_system || pool.protocol_type_name || '')

    return (
        <PoolRowTemplate
            protocol={
                chainId ? (
                    <PoolLink currentChainId={chainId as AppSupportedChainIds} pool={pool} config={protocolConfig} className="" />
                ) : (
                    <div className="flex items-center gap-2">
                        <FileMapper id={getProtocolConfig(pool.protocol_system).fileId} className="size-6 rounded-full bg-milk-100" />
                        <p className="truncate">{getProtocolConfig(pool.protocol_system).name}</p>
                    </div>
                )
            }
            range={<Range inRange={!!isInRange} />}
            poolPrice={
                <StyledTooltip
                    content={
                        poolPrice ? (
                            <div className="flex flex-col">
                                {/* <p className="font-semibold">Pool spot price (mid-price)</p> */}
                                {/* <p className="text-xs">Pool index: {poolIndex}</p> */}
                                <p className="mt-1 text-xs">
                                    {numeral(poolPrice).format('0,0.[0000000]')} {quoteSymbol} / {baseSymbol}
                                </p>
                                <p className="mt-1 text-xs">
                                    {numeral(1 / poolPrice).format('0,0.[0000000]')} {baseSymbol} / {quoteSymbol}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-1 text-xs">No price</p>
                        )
                    }
                >
                    <p className="cursor-help truncate text-milk">{poolPrice ? numeral(poolPrice).format('0,0.[00]') : '-'}</p>
                </StyledTooltip>
            }
            lastUpdate={<LiveDate date={pool.last_updated_at * 1000}>{DAYJS_FORMATS.timeAgo(pool.last_updated_at * 1000)}</LiveDate>}
            base={{
                balance: <p className="text-milk">{baseLiquidity ? numeral(baseLiquidity).format('0,0a') : '-'}</p>,
                usd: <p className="text-milk">{baseUsd > 0 ? `$${numeral(baseUsd).format('0,0a')}` : '-'}</p>,
                percent: <p className="text-milk">{basePercent > 0 ? numeral(basePercent / 100).format('0,0%') : '-'}</p>,
            }}
            quote={{
                balance: <p className="text-milk">{quoteLiquidity ? numeral(quoteLiquidity).format('0,0a') : '-'}</p>,
                usd: <p className="text-milk">{quoteUsd > 0 ? `$${numeral(quoteUsd).format('0,0a')}` : '-'}</p>,
                percent: <p className="text-milk">{quotePercent > 0 ? numeral(quotePercent / 100).format('0,0%') : '-'}</p>,
            }}
            tvlUsd={<p className="text-milk">{poolTvlUsd > 0 ? `$${numeral(poolTvlUsd).format('0,0a')}` : '-'}</p>}
            tvlPercent={<p className="text-milk">{tvlPercent > 0 ? numeral(tvlPercent / 100).format('0,0%') : '-'}</p>}
            className={cn('py-3 transition-colors duration-200 hover:bg-milk-100', className)}
        />
    )
}
/**
 * ------------------------ 5 list
 */

interface PoolsListProps {
    chainId?: number
    token0?: string
    token1?: string
    isInRange: boolean
    targetSpreadBps?: number
    referencePrice?: number
    onRefreshData?: (refetchInterval: number, dataUpdatedAt: number) => void
}

export function PoolsList({ chainId, token0, token1, isInRange, targetSpreadBps, referencePrice, onRefreshData }: PoolsListProps) {
    // Get the chain name for the orderbook API
    const chainName = chainId ? CHAINS_CONFIG[chainId]?.idForOrderbookApi : undefined

    const {
        data: orderbookData,
        isLoading,
        refetchInterval,
        dataUpdatedAt,
    } = usePoolsData({
        chain: chainName || '',
        token0: token0 || '',
        token1: token1 || '',
        enabled: !!chainName && !!token0 && !!token1,
    })

    // Extract data from orderbook - no useMemo needed for simple references
    const pools = orderbookData?.pools || []
    const poolPrices = orderbookData?.prices_base_to_quote || []
    const baseLiquidities = orderbookData?.base_lqdty || []
    const quoteLiquidities = orderbookData?.quote_lqdty || []
    const ethUsd = orderbookData?.eth_usd || 0
    const baseWorthEth = orderbookData?.base_worth_eth || 0
    const quoteWorthEth = orderbookData?.quote_worth_eth || 0
    const baseSymbol = orderbookData?.base?.symbol || 'Base'
    const quoteSymbol = orderbookData?.quote?.symbol || 'Quote'

    // Calculate totals
    const totalBaseLiquidity = baseLiquidities.reduce((sum, amount) => sum + (amount || 0), 0)
    const totalQuoteLiquidity = quoteLiquidities.reduce((sum, amount) => sum + (amount || 0), 0)
    const totalBaseUsd = totalBaseLiquidity * baseWorthEth * ethUsd
    const totalQuoteUsd = totalQuoteLiquidity * quoteWorthEth * ethUsd
    const totalTvlUsd = totalBaseUsd + totalQuoteUsd

    // Sort pools by TVL (descending)
    const sortedPoolIndices = pools
        .map((_, index) => index)
        .sort((a, b) => {
            const tvlA = (baseLiquidities[a] || 0) * baseWorthEth * ethUsd + (quoteLiquidities[a] || 0) * quoteWorthEth * ethUsd
            const tvlB = (baseLiquidities[b] || 0) * baseWorthEth * ethUsd + (quoteLiquidities[b] || 0) * quoteWorthEth * ethUsd
            return tvlB - tvlA
        })

    // Notify parent of refresh data
    React.useEffect(() => {
        if (onRefreshData && refetchInterval && dataUpdatedAt) {
            onRefreshData(refetchInterval, dataUpdatedAt)
        }
    }, [onRefreshData, refetchInterval, dataUpdatedAt])

    // easy ternary
    const showLoading = isLoading && (!pools || pools.length === 0)
    const noData = !isLoading && (!pools || pools.length === 0)

    // render table
    return (
        <div className="w-full rounded-xl">
            <div className="w-full overflow-x-auto">
                <div className={cn('flex max-h-[60vh] w-full min-w-[1200px] flex-col')}>
                    <PoolsTableHeaders baseSymbol={baseSymbol} quoteSymbol={quoteSymbol} />
                    {showLoading ? (
                        <LoadingPoolsRows />
                    ) : noData ? (
                        <EmptyPlaceholder entryName="pools" />
                    ) : (
                        <div className="flex flex-col overflow-y-auto">
                            {sortedPoolIndices.map((poolIndex) => {
                                const pool = pools[poolIndex]
                                // Simple key with pool id and current price to force updates
                                const poolPrice = poolPrices[poolIndex] || 0
                                const uniqueKey = `${pool.id}-${poolIndex}`

                                // Calculate if this specific pool is in range
                                const poolIsInRange = calculatePoolInRange(poolPrice, referencePrice, targetSpreadBps, isInRange)

                                return (
                                    <PoolRow
                                        key={uniqueKey}
                                        pool={pool}
                                        poolPrice={poolPrice}
                                        isInRange={poolIsInRange}
                                        baseSymbol={baseSymbol}
                                        quoteSymbol={quoteSymbol}
                                        baseLiquidity={baseLiquidities[poolIndex]}
                                        quoteLiquidity={quoteLiquidities[poolIndex]}
                                        ethUsd={ethUsd}
                                        baseWorthEth={baseWorthEth}
                                        quoteWorthEth={quoteWorthEth}
                                        totalBaseLiquidity={totalBaseLiquidity}
                                        totalQuoteLiquidity={totalQuoteLiquidity}
                                        chainId={chainId}
                                        className="border-t border-milk-100"
                                    />
                                )
                            })}

                            {/* Totals row */}
                            {pools.length > 0 && (
                                <PoolRowTemplate
                                    protocol={<span className="text-milk-400">Total</span>}
                                    range={<span></span>}
                                    poolPrice={<span></span>}
                                    lastUpdate={<span></span>}
                                    base={{
                                        balance: <span className="text-milk-400">{numeral(totalBaseLiquidity).format('0,0a')}</span>,
                                        usd: <span className="text-milk-400">${numeral(totalBaseUsd).format('0,0a')}</span>,
                                        percent: <span className="text-milk-400">100%</span>,
                                    }}
                                    quote={{
                                        balance: <span className="text-milk-400">{numeral(totalQuoteLiquidity).format('0,0a')}</span>,
                                        usd: <span className="text-milk-400">${numeral(totalQuoteUsd).format('0,0a')}</span>,
                                        percent: <span className="text-milk-400">100%</span>,
                                    }}
                                    tvlUsd={<span className="text-milk-400">${numeral(totalTvlUsd).format('0,0a')}</span>}
                                    tvlPercent={<span className="text-milk-400">100%</span>}
                                    className="border-t border-milk-100 py-3 text-sm"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

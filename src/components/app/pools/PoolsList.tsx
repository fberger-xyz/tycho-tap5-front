'use client'

import React, { ReactNode, memo, useMemo } from 'react'
import { usePoolsData } from '@/hooks/fetchs/usePoolsData'
import { cn, mapProtocolIdToProtocolConfig } from '@/utils'
import { EmptyPlaceholder } from '../shared/PlaceholderTemplates'
import numeral from 'numeral'
import { AmmPool } from '@/interfaces'
import FileMapper from '@/components/icons/FileMapper'
import { getProtocolConfig, CHAINS_CONFIG } from '@/config'
import StyledTooltip from '@/components/common/StyledTooltip'
import { LiveDate } from '@/components/common/LiveDate'
import PoolLink from './LinkToPool'
import { AppSupportedChainIds } from '@/enums'

// todo simulation failed pas de broadcast data

/**
 * ------------------------ 1 template
 */

export const PoolRowTemplate = (props: {
    protocol: ReactNode
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
        <div className={cn('grid grid-cols-12 w-full items-center text-sm gap-3 px-4', props.className)}>
            <div className="col-span-2">{props.protocol}</div>
            <div className="col-span-1">{props.poolPrice}</div>
            <div className="col-span-1">{props.lastUpdate}</div>

            {/* Base token columns */}
            <div className="col-span-3 grid grid-cols-3 w-full">
                <div className="col-span-1 text-right">{props.base.balance}</div>
                <div className="col-span-1 text-center">{props.base.usd}</div>
                <div className="col-span-1 text-right">{props.base.percent}</div>
            </div>

            {/* Quote token columns */}
            <div className="col-span-3 grid grid-cols-3 w-full">
                <div className="col-span-1 text-right">{props.quote.balance}</div>
                <div className="col-span-1 text-right">{props.quote.usd}</div>
                <div className="col-span-1 text-right">{props.quote.percent}</div>
            </div>

            {/* TVL columns */}
            <div className="col-span-1 text-right">{props.tvlUsd}</div>
            <div className="col-span-1 text-right">{props.tvlPercent}</div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function PoolsTableHeaders({ baseSymbol = 'Base', quoteSymbol = 'Quote' }: { baseSymbol?: string; quoteSymbol?: string }) {
    return (
        <div className="grid grid-cols-12 w-full items-end gap-3 px-4 text-milk-400 text-xs pb-2">
            <div className="col-span-2">Protocol</div>
            <div className="col-span-1">Pool price</div>
            <div className="col-span-1">Last updated</div>

            {/* Base token columns */}
            <div className="flex flex-col gap-2 col-span-3">
                <div className="font-semibold text-milk text-center pb-1 border-b border-milk-100">{baseSymbol}</div>
                <div className="col-span-3 grid grid-cols-3 w-full">
                    <div className="col-span-1 text-right">Balance</div>
                    <div className="col-span-1 text-center">k$</div>
                    <div className="col-span-1 text-right">%</div>
                </div>
            </div>

            {/* Quote token columns */}
            <div className="flex flex-col gap-2 col-span-3">
                <div className="font-semibold text-milk text-center pb-1 border-b border-milk-100">{quoteSymbol}</div>
                <div className="grid grid-cols-3 w-full">
                    <div className="col-span-1 text-right">Balance</div>
                    <div className="col-span-1 text-right">k$</div>
                    <div className="col-span-1 text-right">%</div>
                </div>
            </div>

            {/* TVL columns */}
            <div className="flex flex-col gap-2 col-span-2">
                <div className="font-semibold text-milk text-center pb-1 border-b border-milk-100">TVL</div>
                <div className="grid grid-cols-2 gap-1">
                    <div className="text-right">k$</div>
                    <div className="text-right">%</div>
                </div>
            </div>
        </div>
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingPoolsRows() {
    const loadingParagraph = <p className="w-3/4 skeleton-loading h-6 rounded-lg mr-auto">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 pb-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <PoolRowTemplate
                        key={i}
                        protocol={loadingParagraph}
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
                        className="py-2 rounded-lg text-transparent border-b border-milk-50"
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
    poolIndex: number
    poolPrice?: number
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

// Custom comparison function for memo to ensure updates when pool data changes
const arePoolRowPropsEqual = (prevProps: PoolRowProps, nextProps: PoolRowProps) => {
    // Check if pool price changed
    if (prevProps.poolPrice !== nextProps.poolPrice) return false
    // Check if liquidity values changed
    if (prevProps.baseLiquidity !== nextProps.baseLiquidity) return false
    if (prevProps.quoteLiquidity !== nextProps.quoteLiquidity) return false
    // Check if USD values changed
    if (prevProps.ethUsd !== nextProps.ethUsd) return false
    if (prevProps.baseWorthEth !== nextProps.baseWorthEth) return false
    if (prevProps.quoteWorthEth !== nextProps.quoteWorthEth) return false
    // Check if totals changed
    if (prevProps.totalBaseLiquidity !== nextProps.totalBaseLiquidity) return false
    if (prevProps.totalQuoteLiquidity !== nextProps.totalQuoteLiquidity) return false
    // Check if pool object reference changed
    if (prevProps.pool !== nextProps.pool) return false

    return true
}

export const PoolRow = memo(function PoolRow({
    pool,
    poolIndex,
    poolPrice,
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
    // Calculate time since last update (last_updated_at is in seconds, not milliseconds)
    const minutesAgo = pool.last_updated_at ? Math.floor((Date.now() / 1000 - pool.last_updated_at) / 60) : 0

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
            poolPrice={
                <StyledTooltip
                    content={
                        <div className="flex flex-col">
                            <p className="font-semibold">Pool spot price (mid-price)</p>
                            <p className="text-xs">Pool index: {poolIndex}</p>
                            <p className="text-xs mt-1">Price: {numeral(poolPrice).format('0,0.[0000000]')}</p>
                        </div>
                    }
                >
                    <p className="truncate cursor-help text-milk">{poolPrice ? numeral(poolPrice).format('0,0.[00]') : '-'}</p>
                </StyledTooltip>
            }
            lastUpdate={<LiveDate date={pool.last_updated_at * 1000}>{minutesAgo > 0 ? `${minutesAgo} min ago` : 'Just now'}</LiveDate>}
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
            className={cn('py-3 hover:bg-milk-100 transition-colors duration-200', className)}
        />
    )
}, arePoolRowPropsEqual)
/**
 * ------------------------ 5 list
 */

interface PoolsListProps {
    chainId?: number
    token0?: string
    token1?: string
    targetSpreadBps?: number
    onRefreshData?: (refetchInterval: number, dataUpdatedAt: number) => void
}

export function PoolsList({ chainId, token0, token1, onRefreshData }: PoolsListProps) {
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

    // Extract data from orderbook
    const pools = orderbookData?.pools || []
    const poolPrices = useMemo(() => orderbookData?.prices_base_to_quote || [], [orderbookData?.prices_base_to_quote])
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

    // Notify parent of refresh data and log updates
    React.useEffect(() => {
        if (onRefreshData && refetchInterval && dataUpdatedAt) {
            onRefreshData(refetchInterval, dataUpdatedAt)
        }

        // Log data updates for debugging
        if (poolPrices.length > 0) {
            console.log('[PoolsList] Data updated at:', new Date(dataUpdatedAt).toISOString(), {
                poolsCount: pools.length,
                firstPoolPrice: poolPrices[0],
                timestamp: orderbookData?.timestamp,
                block: orderbookData?.block,
            })
        }
    }, [onRefreshData, refetchInterval, dataUpdatedAt, poolPrices, pools.length, orderbookData?.timestamp, orderbookData?.block])

    // easy ternary
    const showLoading = isLoading && (!pools || pools.length === 0)
    const noData = !isLoading && (!pools || pools.length === 0)

    // render table
    return (
        <div className="rounded-xl w-full">
            <div className="overflow-x-auto w-full">
                <div className={cn('flex flex-col min-w-[1200px] max-h-[60vh] w-full')}>
                    <PoolsTableHeaders baseSymbol={baseSymbol} quoteSymbol={quoteSymbol} />
                    {showLoading ? (
                        <LoadingPoolsRows />
                    ) : noData ? (
                        <EmptyPlaceholder entryName="pools" />
                    ) : (
                        <div className="flex flex-col overflow-y-auto">
                            {sortedPoolIndices.map((poolIndex) => {
                                const pool = pools[poolIndex]
                                // Include data timestamp in key to force re-render on data updates
                                const uniqueKey = `${pool.id}-${poolIndex}-${poolPrices[poolIndex]}-${dataUpdatedAt}`
                                return (
                                    <PoolRow
                                        key={uniqueKey}
                                        pool={pool}
                                        poolIndex={poolIndex}
                                        poolPrice={poolPrices[poolIndex]}
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
                                    protocol={<span>Total</span>}
                                    poolPrice={<span></span>}
                                    lastUpdate={<span></span>}
                                    base={{
                                        balance: <span className="text-milk">{numeral(totalBaseLiquidity).format('0,0a')}</span>,
                                        usd: <span className="text-milk">${numeral(totalBaseUsd).format('0,0a')}</span>,
                                        percent: <span className="text-milk">100%</span>,
                                    }}
                                    quote={{
                                        balance: <span className="text-milk">{numeral(totalQuoteLiquidity).format('0,0a')}</span>,
                                        usd: <span className="text-milk">${numeral(totalQuoteUsd).format('0,0a')}</span>,
                                        percent: <span className="text-milk">100%</span>,
                                    }}
                                    tvlUsd={<span className="text-milk">${numeral(totalTvlUsd).format('0,0a')}</span>}
                                    tvlPercent={<span className="text-milk">100%</span>}
                                    className="py-3 border-t border-milk-100"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

'use client'

import React, { ReactNode, memo } from 'react'
import { usePoolsData } from '@/hooks/fetchs/usePoolsData'
import { cn } from '@/utils'
import { EmptyPlaceholder } from '../shared/PlaceholderTemplates'
import numeral from 'numeral'
import { AmmPool } from '@/interfaces'
import { Range } from '@/components/figma/Tags'
import FileMapper from '@/components/icons/FileMapper'
import { getProtocolConfig, CHAINS_CONFIG } from '@/config'
import StyledTooltip from '@/components/common/StyledTooltip'
import { LiveDate } from '@/components/common/LiveDate'

// todo simulation failed pas de broadcast data

/**
 * ------------------------ 1 template
 */

export const CELL_WIDTHS = {
    protocol: 120,
    status: 100,
    spotPrice: 100,
    delta: 80,
    depth: 100,
    fee: 80,
    lastUpdate: 120,
}

export const PoolRowTemplate = (props: {
    protocol: ReactNode
    status: ReactNode
    spotPrice: ReactNode
    delta: ReactNode
    depth: ReactNode
    fee: ReactNode
    lastUpdate: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('flex w-full items-center text-sm gap-2 overflow-hidden', props.className)}>
            <div className={`w-[140px]`}>{props.protocol}</div>
            <div className={`w-[100px]`}>{props.status}</div>
            <div className={`w-[100px]`}>{props.spotPrice}</div>
            <div className={`w-[80px]`}>{props.delta}</div>
            <div className={`w-[100px]`}>{props.depth}</div>
            <div className={`w-[80px]`}>{props.fee}</div>
            <div className={`w-[120px]`}>{props.lastUpdate}</div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function PoolsTableHeaders() {
    return (
        <PoolRowTemplate
            protocol={<p>Protocol</p>}
            status={<p>Status</p>}
            spotPrice={<p>Spot Price</p>}
            delta={<p>Delta</p>}
            depth={<p>2% Depth</p>}
            fee={<p>Fee</p>}
            lastUpdate={<p>Last update</p>}
            className="px-4 py-3 text-milk-600 text-xs"
        />
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingPoolsRows() {
    const loadingParagraph = <p className="w-3/4 skeleton-loading h-6 rounded-lg mr-auto">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <PoolRowTemplate
                        key={i}
                        protocol={loadingParagraph}
                        status={loadingParagraph}
                        spotPrice={loadingParagraph}
                        delta={loadingParagraph}
                        depth={loadingParagraph}
                        fee={loadingParagraph}
                        lastUpdate={loadingParagraph}
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

export const PoolRow = memo(function PoolRow({
    pool,
    referencePrice,
    targetSpreadBps = 10,
    className,
}: {
    pool: AmmPool
    referencePrice?: number
    targetSpreadBps?: number
    className?: string
}) {
    // Calculate time since last update (last_updated_at is in seconds, not milliseconds)
    const minutesAgo = pool.last_updated_at ? Math.floor((Date.now() / 1000 - pool.last_updated_at) / 60) : 0

    // For now, we don't have pool-specific spot prices, so we'll use placeholder values
    // In the future, this could be calculated from pool reserves or other data
    const spotPrice = referencePrice || 0
    const delta = targetSpreadBps || 0
    const isOutOfRange = delta > targetSpreadBps
    const depth = '-' // Placeholder until we have depth data

    return (
        <PoolRowTemplate
            protocol={
                <div className="flex items-center gap-2">
                    <FileMapper id={getProtocolConfig(pool.protocol_system).fileId} className="size-6 rounded-full bg-milk-100" />
                    <p className="truncate">{getProtocolConfig(pool.protocol_system).name}</p>
                </div>
            }
            status={<Range inRange={!isOutOfRange} className="text-xs rounded" />}
            spotPrice={spotPrice > 0 ? <p className="truncate">${numeral(spotPrice).format('0,0.00')}</p> : <p className="truncate">-</p>}
            delta={
                <StyledTooltip
                    content="Delta represents the price deviation between this pool's spot price and the reference price, measured in basis points (bps). Formula: ((pool_price - reference_price) / reference_price) × 10000"
                    className="max-w-xs"
                >
                    <p className="truncate cursor-help underline-offset-2 hover:underline decoration-dotted">{delta} bps</p>
                </StyledTooltip>
            }
            depth={<p className="truncate">{depth}</p>}
            fee={<p className="truncate">{numeral(pool.fee).format('0.[00]')} bps</p>}
            lastUpdate={<LiveDate date={pool.last_updated_at * 1000}>{minutesAgo > 0 ? `${minutesAgo} min ago` : 'Just now'}</LiveDate>}
            className={cn('px-4 py-3 hover:bg-milk-100 transition-colors duration-200', className)}
        />
    )
})
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

export function PoolsList({ chainId, token0, token1, targetSpreadBps = 10, onRefreshData }: PoolsListProps) {
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

    // Debug logging removed to prevent re-renders

    const pools = orderbookData?.pools || []
    const referencePrice = orderbookData?.mpd_base_to_quote?.mid || 0

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
        <div className="rounded-xl w-full">
            <div className="overflow-x-auto w-full">
                <div className={cn('flex flex-col min-w-max max-h-[50vh] w-full')}>
                    <PoolsTableHeaders />
                    {showLoading ? (
                        <LoadingPoolsRows />
                    ) : noData ? (
                        <EmptyPlaceholder entryName="pools" />
                    ) : (
                        <div className="flex flex-col overflow-y-auto">
                            {pools?.map((pool, poolIndex) => (
                                <PoolRow
                                    key={`${pool.id}-${poolIndex}`}
                                    pool={pool}
                                    referencePrice={referencePrice}
                                    targetSpreadBps={targetSpreadBps}
                                    className="border-t border-milk-100"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

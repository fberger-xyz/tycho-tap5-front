'use client'

import { TradesTableHeaders } from './TradesTableRow'
import { TradeRow } from './TradesTableRow'
import { LoadingTradeRows as LoadingRows } from './TradesTableRow'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import { useRef, useMemo, memo } from 'react'
import { TradeStatus } from '@/enums'

dayjs.extend(relativeTime)

export interface TradeData {
    id: string
    instanceId: string
    chain: string
    chainName?: string
    tokenIn: {
        symbol: string
        amount: string
        valueUsd?: number
    }
    tokenOut: {
        symbol: string
        amount: string
        valueUsd?: number
    }
    pool: {
        protocol: string
        address: string
        fee?: number
    }
    status: TradeStatus
    gasCost?: {
        amount: string
        valueUsd?: number
    }
    netProfit?: {
        amount: string
        valueUsd?: number
    }
    timestamp: Date | string
    txHash?: string
}

interface FormattedTrade extends TradeData {
    formattedTimestamp: string
    formattedTimeAgo: string
}

const TradeRows = memo(function TradeRows({
    trades,
    virtualizer,
    parentRef,
}: {
    trades: FormattedTrade[]
    virtualizer: ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>
    parentRef: React.RefObject<HTMLDivElement | null>
}) {
    return (
        <div ref={parentRef} className="max-h-[60vh] overflow-y-auto transition-all duration-200 ease-in-out">
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem: VirtualItem) => {
                    const trade = trades[virtualItem.index]
                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                                pointerEvents: 'auto',
                            }}
                        >
                            <TradeRow trade={trade} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export function TradesTable({ data, isLoading }: { data?: TradeData[]; isLoading?: boolean }) {
    // virtualizer
    const parentRef = useRef<HTMLDivElement>(null)
    const trades = useMemo((): FormattedTrade[] => {
        if (!data || data.length === 0) return []
        return data.map((trade): FormattedTrade => {
            return {
                ...trade,
                formattedTimestamp: dayjs(trade.timestamp).format('MMM D, HH:mm:ss'),
                formattedTimeAgo: dayjs(trade.timestamp).fromNow(),
            }
        })
    }, [data])
    const virtualizer = useVirtualizer({
        count: trades.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
        overscan: 8,
    })

    // render
    return (
        <div className="w-full border border-milk-150 p-4 rounded-xl">
            <div className="overflow-x-scroll">
                <div className="flex min-w-[1500px] w-full flex-col overflow-hidden gap-2">
                    <TradesTableHeaders />
                    {isLoading ? (
                        <LoadingRows />
                    ) : !data || data.length === 0 ? (
                        <div className="bg-milk-50 px-3 rounded-lg text-transparent flex items-center justify-center py-8">
                            <p className="m-auto text-folly">No trades</p>
                        </div>
                    ) : (
                        <TradeRows trades={trades} virtualizer={virtualizer} parentRef={parentRef} />
                    )}
                </div>
            </div>
        </div>
    )
}

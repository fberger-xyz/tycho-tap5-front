'use client'

import { TradesTableHeaders, TradeRow, LoadingTradeRows as LoadingRows } from '@/components/app/sections/activity/TradesTableRow'
import { useMemo, memo } from 'react'
import { useInstanceTradesData } from '@/hooks/fetchs/details/useInstanceTradesData'
import { FormattedTrade } from '@/interfaces'
import { formatTradeTimestamp } from '@/utils'

// Simple rows without virtualization
const TradeRows = memo(function TradeRows({ trades }: { trades: FormattedTrade[] }) {
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {trades.map((trade) => (
                    <TradeRow key={trade.id} trade={trade} />
                ))}
            </div>
        </div>
    )
})

interface InstanceTradesTableProps {
    instanceId: string
}

export function InstanceTradesTable({ instanceId }: InstanceTradesTableProps) {
    const { trades, isLoading } = useInstanceTradesData(instanceId)

    // format trades
    const formattedTrades = useMemo((): FormattedTrade[] => {
        if (!trades || trades.length === 0) return []
        return trades.map((trade): FormattedTrade => {
            return {
                ...trade,
                ...formatTradeTimestamp(trade.timestamp),
            }
        })
    }, [trades])

    // render table
    return (
        <div className="w-full border border-milk-150 pt-4 rounded-xl">
            <div className="overflow-x-auto">
                <div className="flex min-w-[1420px] w-full flex-col overflow-hidden gap-2">
                    <TradesTableHeaders />
                    {isLoading ? (
                        <LoadingRows />
                    ) : !trades || trades.length === 0 ? (
                        <div className="bg-milk-50 px-3 rounded-lg text-transparent flex items-center justify-center py-8">
                            <p className="m-auto text-folly">No recent trades for this instance</p>
                        </div>
                    ) : (
                        <TradeRows trades={formattedTrades} />
                    )}
                </div>
            </div>
        </div>
    )
}

'use client'

import { TradesTableHeaders } from './TradesTableRow'
import { TradeRow } from './TradesTableRow'
import { LoadingTradeRows as LoadingRows } from './TradesTableRow'
import { useMemo, memo } from 'react'
import { useTradesData } from '@/hooks/fetchs/all/useTradesData'
import { FormattedTrade } from '@/interfaces'
import { DAYJS_FORMATS } from '@/utils'

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

export function TradesTable() {
    const { trades, isLoading } = useTradesData()

    // format trades
    const formattedTrades = useMemo((): FormattedTrade[] => {
        if (!trades || trades.length === 0) return []
        return trades.map((trade): FormattedTrade => {
            return {
                ...trade,
                formattedTimestamp: DAYJS_FORMATS.date(trade.timestamp),
                formattedTimeAgo: DAYJS_FORMATS.timeAgo(trade.timestamp),
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
                            <p className="m-auto text-folly">No recent trades</p>
                        </div>
                    ) : (
                        <TradeRows trades={formattedTrades} />
                    )}
                </div>
            </div>
        </div>
    )
}

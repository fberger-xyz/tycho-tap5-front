'use client'

import { cn } from '@/utils'
import { EmptyPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { LoadingRecentTradeRows, RecentTradeRow, RecentTradesTableHeaders } from '../RecentTradesList'

/**
 * ------------------------ 5 list
 */

export function StrategyTradesList(props: { trades: TradeWithInstanceAndConfiguration[]; isLoading: boolean }) {
    const { trades, isLoading } = props

    // easy ternary
    const showLoading = isLoading && trades.length === 0
    const noData = !isLoading && trades?.length === 0

    // render table
    return (
        <div className="rounded-xl w-full">
            <div className="overflow-x-auto w-full">
                <div className={cn('flex flex-col min-w-max max-h-[50vh] w-full')}>
                    <RecentTradesTableHeaders />
                    {showLoading ? (
                        <LoadingRecentTradeRows />
                    ) : noData ? (
                        <EmptyPlaceholder entryName="trades" />
                    ) : (
                        <div className="flex flex-col overflow-y-auto">
                            {trades.map((trade, tradeIndex) => (
                                <RecentTradeRow key={`${trade.id}-${tradeIndex}`} trade={trade} className="border-t border-milk-100" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

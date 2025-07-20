'use client'

import { ReactNode } from 'react'
import type { TradeData } from './TradesTable'
import { cn } from '@/utils'
import { memo } from 'react'

/**
 * ------------------------ 1 template
 */

export const TradeRowTemplate = (props: {
    instance: ReactNode
    chain: ReactNode
    pair: ReactNode
    amountIn: ReactNode
    amountOut: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('w-full grid grid-cols-12 items-center text-sm', props.className)}>
            {/* A */}
            <div className="grid grid-cols-12 gap-2 items-center col-span-6">
                <div className="text-xs col-span-4">{props.instance}</div>
                <div className="text-xs col-span-4">{props.chain}</div>
                <div className="text-xs col-span-4">{props.pair}</div>
            </div>

            {/* B */}
            <div className="grid grid-cols-12 gap-2 items-center col-span-6">
                <div className="text-xs col-span-6">{props.amountIn}</div>
                <div className="text-xs col-span-6">{props.amountOut}</div>
            </div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function TradesTableHeaders() {
    return (
        <TradeRowTemplate
            instance={<p className="pl-2">Instance</p>}
            chain={<p>Chain</p>}
            pair={<p>Pair</p>}
            amountIn={<p>Amount In</p>}
            amountOut={<p>Amount Out</p>}
            className="text-milk-200"
        />
    )
}

/**
 * ------------------------ 3 loading row
 */

export function LoadingTradeRows() {
    const loadingParagraph = <p className="w-1/2 skeleton-loading h-6 rounded-full">Loading...</p>
    return (
        <div className="overflow-hidden flex flex-col gap-1">
            {Array.from({ length: 8 }, (_, i) => (
                <TradeRowTemplate
                    key={i}
                    instance={loadingParagraph}
                    chain={loadingParagraph}
                    pair={loadingParagraph}
                    amountIn={loadingParagraph}
                    amountOut={loadingParagraph}
                    className="bg-milk-50 px-3 py-2 rounded-lg text-transparent"
                />
            ))}
        </div>
    )
}

/**
 * ------------------------ 4 content row
 */

export const TradeRow = memo(function TradeRow({
    trade,
}: {
    trade: TradeData & {
        formattedTimestamp: string
        formattedTimeAgo: string
    }
}) {
    return (
        <TradeRowTemplate
            instance={<div className="font-medium">{trade.instanceId}</div>}
            chain={<div className="text-milk text-xs">{trade.chainName || trade.chain}</div>}
            pair={
                <div className="w-[120px] px-2 text-milk truncate" title={trade.instanceId}>
                    {trade.instanceId.slice(0, 8)}...
                </div>
            }
            amountIn={
                <div className="w-[150px] px-2">
                    {trade.tokenIn.symbol} → {trade.tokenOut.symbol}
                </div>
            }
            amountOut={
                <div className="w-[120px] px-2">
                    <div className="font-medium">{trade.pool.protocol}</div>
                    {trade.pool.fee && <div className="text-milk text-xs">{trade.pool.fee}%</div>}
                </div>
            }
            className="bg-milk-50 px-3 py-2 rounded-lg hover:bg-milk-100 transition-colors duration-200"
        />
    )
})

// <div className="flex min-w-full items-center justify-between border-b border-milk-100 py-3 pr-4 text-xs hover:bg-milk-50 transition-colors"></div>
//             <div className="w-[150px] px-2">
//                 {trade.tokenIn.symbol} → {trade.tokenOut.symbol}
//             </div>
//             <div className="w-[120px] px-2">
//                 <div className="font-medium">{trade.pool.protocol}</div>
//                 {trade.pool.fee && <div className="text-milk text-xs">{trade.pool.fee}%</div>}
//             </div>
//             <div className="w-[150px] px-2 text-right">
//                 <div className="font-medium">
//                     {formatAmount(trade.tokenIn.amount)} {trade.tokenIn.symbol}
//                 </div>
//                 {trade.tokenIn.valueUsd && <div className="text-milk text-xs">{formatUsdValue(trade.tokenIn.valueUsd)}</div>}
//             </div>
//             <div className="w-[150px] px-2 text-right">
//                 <div className="font-medium">
//                     {formatAmount(trade.tokenOut.amount)} {trade.tokenOut.symbol}
//                 </div>
//                 {trade.tokenOut.valueUsd && <div className="text-milk text-xs">{formatUsdValue(trade.tokenOut.valueUsd)}</div>}
//             </div>
//             <div className="w-[80px] px-2 text-center">
//                 <StatusBadge status={trade.status} />
//             </div>
//             <div className="w-[100px] px-2 text-right">
//                 {trade.gasCost ? (
//                     <>
//                         <div className="font-medium">{formatAmount(trade.gasCost.amount, 6)} ETH</div>
//                         {trade.gasCost.valueUsd && <div className="text-milk text-xs">{formatUsdValue(trade.gasCost.valueUsd)}</div>}
//                     </>
//                 ) : (
//                     '-'
//                 )}
//             </div>
//             <div className="w-[100px] px-2 text-right">
//                 {trade.netProfit ? (
//                     <div className={cn('font-medium', profitClass)}>
//                         {parseFloat(trade.netProfit.amount) > 0 ? '+' : ''}
//                         {formatUsdValue(trade.netProfit.valueUsd)}
//                     </div>
//                 ) : (
//                     '-'
//                 )}
//             </div>
//             <div className="w-[80px] px-2 text-center">
//                 {trade.txHash ? (
//                     <a
//                         href={`https://etherscan.io/tx/${trade.txHash}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:text-blue-800 underline"
//                     >
//                         View
//                     </a>
//                 ) : (
//                     '-'
//                 )}
//             </div>

// const StatusBadge = memo(function StatusBadge({ status }: { status: TradeStatus }) {
//     return (
//         <span
//             className={cn(
//                 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
//                 status === TradeStatus.SUCCESS && 'bg-green-100 text-green-800',
//                 status === TradeStatus.FAILED && 'bg-red-100 text-red-800',
//                 status === TradeStatus.PENDING && 'bg-yellow-100 text-yellow-800',
//             )}
//         >
//             {status}
//         </span>
//     )
// })

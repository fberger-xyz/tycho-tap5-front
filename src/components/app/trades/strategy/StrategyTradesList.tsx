'use client'

import { ReactNode, memo } from 'react'
import { cn, DAYJS_FORMATS, shortenValue } from '@/utils'
import { EmptyPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { LiveDate } from '@/components/common/LiveDate'
import { TradeSide } from '@/components/figma/Tags'
import { SymbolImage } from '@/components/common/ImageWrapper'
import numeral from 'numeral'
import { RoundedAmount } from '@/components/common/RoundedAmount'
import { TradeValuesV2, isSuccessfulTrade, isRevertedTrade, isSimulationFailedTrade } from '@/interfaces/database/trade.interface'
import { LinkToExplorer } from '@/components/common/LinkToExplorer'
import { CHAINS_CONFIG, getProtocolConfig } from '@/config'
import FileMapper from '@/components/icons/FileMapper'
import { jsonConfigParser } from '@/utils/data/parser'
import LinkWrapper from '@/components/common/LinkWrapper'
import StyledTooltip from '@/components/common/StyledTooltip'

/**
 * ------------------------ 1 template
 */

export const RecentTradeRowTemplate = (props: {
    time: ReactNode
    pool: ReactNode
    status: ReactNode
    side: ReactNode
    volume: ReactNode
    in: ReactNode
    out: ReactNode
    profit: ReactNode
    gas: ReactNode
    nonce: ReactNode
    sim: ReactNode
    idx: ReactNode
    tx: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('flex w-full items-center text-sm gap-1', props.className)}>
            <div className="w-[120px]">{props.time}</div>
            <div className="w-[120px]">{props.pool}</div>
            <div className="w-[70px] flex justify-center">{props.status}</div>
            <div className="w-[70px]">{props.side}</div>
            <div className="w-[70px]">{props.volume}</div>
            <div className="w-[105px]">{props.in}</div>
            <div className="w-[105px]">{props.out}</div>
            <div className="w-[90px]">{props.profit}</div>
            <div className="w-[65px]">{props.gas}</div>
            <div className="w-[65px]">{props.nonce}</div>
            <div className="w-[100px]">{props.sim}</div>
            <div className="w-[55px]">{props.idx}</div>
            <div className="w-[80px]">{props.tx}</div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function RecentTradesTableHeaders() {
    return (
        <RecentTradeRowTemplate
            pool={<p className="truncate">Pool</p>}
            time={<p className="truncate">Time</p>}
            status={<p className="truncate">Status</p>}
            side={<p className="truncate">Side</p>}
            volume={<p className="truncate">Volume</p>}
            in={<p className="truncate">In</p>}
            out={<p className="truncate">Out</p>}
            profit={<p className="truncate">Profit (bps)</p>}
            gas={<p className="truncate">Gas</p>}
            nonce={<p className="truncate">Nonce</p>}
            sim={<p className="truncate">Simulation (ms)</p>}
            idx={<p className="truncate">Index</p>}
            tx={<p className="truncate">Tx</p>}
            className="px-4 py-3 text-milk-600 text-xs"
        />
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingRecentTradeRows() {
    const loadingParagraph = <p className="w-3/4 skeleton-loading h-8 rounded-lg mr-auto">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {Array.from({ length: 8 }, (_, i) => (
                    <RecentTradeRowTemplate
                        key={i}
                        time={loadingParagraph}
                        status={loadingParagraph}
                        side={loadingParagraph}
                        pool={loadingParagraph}
                        volume={loadingParagraph}
                        in={loadingParagraph}
                        out={loadingParagraph}
                        profit={loadingParagraph}
                        gas={loadingParagraph}
                        nonce={loadingParagraph}
                        sim={loadingParagraph}
                        idx={loadingParagraph}
                        tx={loadingParagraph}
                        className="py-2 rounded-lg text-transparent border-b border-milk-50"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * ------------------------ 4 validation utilities
 */

// function isValidTradePattern(tradeValues: unknown): tradeValues is TradeValuesV2 {
//     try {
//         // Check basic structure
//         const values = tradeValues as { data?: unknown; identifier?: unknown }
//         if (!values?.data || !values?.identifier) return false

//         const data = values.data as {
//             status?: string
//             context?: unknown
//             metadata?: {
//                 base_token?: string
//                 quote_token?: string
//                 profit_delta_bps?: number
//                 amount_in_normalized?: number
//                 amount_out_expected?: number
//             }
//             inventory?: unknown
//             simulation?: unknown
//             broadcast?: unknown
//         }

//         // Check required fields
//         if (!data.status || !data.context || !data.metadata || !data.inventory || !data.simulation) return false

//         // Check status is one of expected values
//         if (!['BroadcastSucceeded', 'SimulationFailed'].includes(data.status)) return false

//         // If BroadcastSucceeded, must have broadcast data
//         if (data.status === 'BroadcastSucceeded' && !data.broadcast) return false

//         // If SimulationFailed, broadcast should be null
//         if (data.status === 'SimulationFailed' && data.broadcast !== null) return false

//         // Check metadata has required fields
//         if (
//             !data.metadata.base_token ||
//             !data.metadata.quote_token ||
//             data.metadata.profit_delta_bps === undefined ||
//             data.metadata.amount_in_normalized === undefined ||
//             data.metadata.amount_out_expected === undefined
//         )
//             return false

//         return true
//     } catch {
//         return false
//     }
// }

function getTradeStatusIcon(tradeValues: TradeValuesV2) {
    if (isSuccessfulTrade(tradeValues)) {
        return <div className="size-2 rounded-full bg-aquamarine" title="Transaction successful" />
    }
    if (isRevertedTrade(tradeValues)) {
        return <div className="size-2 rounded-full bg-folly" title="Transaction reverted" />
    }
    if (isSimulationFailedTrade(tradeValues)) {
        return <div className="size-2 rounded-full bg-yellow-500" title="Simulation failed" />
    }
    return null
}

// function getTradeStatusTooltip(tradeValues: TradeValuesV2): string {
//     if (isSuccessfulTrade(tradeValues)) {
//         const blockDelta = tradeValues.data.broadcast.receipt.block_number - tradeValues.data.context.block
//         return `Success - Gas: ${numeral(tradeValues.data.broadcast.receipt.gas_used).format('0,0')} | Block +${blockDelta} | Index: ${tradeValues.data.broadcast.receipt.transaction_index}`
//     }
//     if (isRevertedTrade(tradeValues)) {
//         return `Reverted - Gas wasted: ${numeral(tradeValues.data.broadcast.receipt.gas_used).format('0,0')}`
//     }
//     if (isSimulationFailedTrade(tradeValues)) {
//         return `Simulation failed: ${tradeValues.data.simulation.error}`
//     }
//     return ''
// }

/**
 * ------------------------ 5 content
 */

export const RecentTradeRow = memo(function RecentTradeRow({ trade, className }: { trade: TradeWithInstanceAndConfiguration; className?: string }) {
    if (!trade.Instance.Configuration) return null

    // Validate trade pattern
    const tradeValues = trade.values as unknown
    if (!isValidTradePattern(tradeValues)) return null

    const validTradeValues = tradeValues as TradeValuesV2
    const parsedConfig = jsonConfigParser(trade.Instance.Configuration.id, trade.Instance.Configuration.values)
    const poolAddress = validTradeValues.data.metadata?.pool ?? 'Unknown'

    // Get tx hash based on trade type
    const txHash = validTradeValues.data.broadcast?.hash ?? ''
    const isReverted = isRevertedTrade(validTradeValues)
    const hasValidTx = txHash && txHash.startsWith('0x')

    // Calculate gas cost in USD
    const gasCostUsd = validTradeValues.data.metadata.gas_cost_usd

    // Calculate volume in USD
    const baseToken = validTradeValues.data.metadata.base_token.toUpperCase()
    const quoteToken = validTradeValues.data.metadata.quote_token.toUpperCase()
    let volumeUsd = 0

    if (baseToken === 'WETH' || baseToken === 'ETH') {
        volumeUsd = validTradeValues.data.metadata.amount_in_normalized * validTradeValues.data.metadata.reference_price
    } else if (quoteToken === 'WETH' || quoteToken === 'ETH') {
        volumeUsd = validTradeValues.data.metadata.amount_in_normalized
    } else {
        volumeUsd = validTradeValues.data.metadata.amount_in_normalized
    }
    return (
        <RecentTradeRowTemplate
            time={<LiveDate date={trade.createdAt}>{DAYJS_FORMATS.timeAgo(trade.createdAt)}</LiveDate>}
            status={
                <StyledTooltip
                    content={
                        isSuccessfulTrade(tradeValues)
                            ? 'Success'
                            : isRevertedTrade(tradeValues)
                              ? 'Reverted'
                              : isSimulationFailedTrade(tradeValues)
                                ? 'Simulation failed'
                                : 'No status'
                    }
                >
                    <p className="w-4 mx-auto cursor-help">{getTradeStatusIcon(validTradeValues)}</p>
                </StyledTooltip>
            }
            side={<TradeSide side={validTradeValues.data.metadata.trade_direction === 'Buy' ? 'buy' : 'sell'} />}
            pool={
                <div className="flex items-center gap-2">
                    <FileMapper
                        id={getProtocolConfig(trade.Instance.Configuration.values as string).fileId}
                        className="size-6 rounded-full bg-milk-100"
                    />
                    <LinkWrapper
                        href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/contract/${poolAddress}`}
                        className="truncate hover:underline cursor-alias"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {shortenValue(poolAddress)}
                    </LinkWrapper>
                </div>
            }
            volume={
                <StyledTooltip
                    content={
                        <div className="flex flex-col gap-1">
                            <p>Volume: ${numeral(volumeUsd).format('0,0')}</p>
                        </div>
                    }
                >
                    <p className="text-sm">${numeral(volumeUsd).format('0,0')}</p>
                </StyledTooltip>
            }
            in={
                <div className="flex items-center gap-2">
                    <SymbolImage symbol={validTradeValues.data.metadata.base_token} size={20} />
                    <RoundedAmount amount={validTradeValues.data.metadata.amount_in_normalized}>
                        {numeral(validTradeValues.data.metadata.amount_in_normalized).format('0,0.[00]')}
                    </RoundedAmount>
                </div>
            }
            out={
                <div className="flex items-center gap-2">
                    <SymbolImage symbol={validTradeValues.data.metadata.quote_token} size={20} />
                    <RoundedAmount amount={validTradeValues.data.metadata.amount_out_expected}>
                        {numeral(validTradeValues.data.metadata.amount_out_expected).format('0,0.[00]')}
                    </RoundedAmount>
                </div>
            }
            profit={
                <div className="flex items-center gap-1">
                    <p
                        className={cn(
                            'text-sm',
                            isReverted || validTradeValues.data.status === 'SimulationFailed'
                                ? 'line-through opacity-50'
                                : validTradeValues.data.metadata.profit_delta_bps > 0
                                  ? 'text-aquamarine'
                                  : '',
                        )}
                    >
                        {validTradeValues.data.metadata.profit_delta_bps > 0 ? '+' : ''}
                        {numeral(validTradeValues.data.metadata.profit_delta_bps).format('0.[00]')}
                    </p>
                </div>
            }
            gas={
                <StyledTooltip
                    content={
                        <div className="flex flex-col gap-1">
                            <p>Gas cost: ${numeral(gasCostUsd).format('0,0.000000')}</p>
                            <p>Gas used: {numeral(validTradeValues.data.broadcast?.receipt.gas_used).format('0,0')}</p>
                        </div>
                    }
                >
                    <p className="text-sm text-milk-600 cursor-pointer">${numeral(gasCostUsd).format('0,0.[00]')}</p>
                </StyledTooltip>
            }
            nonce={
                <p className="text-sm text-milk-600" title={`Transaction nonce: ${validTradeValues.data.inventory.nonce}`}>
                    {numeral(validTradeValues.data.inventory.nonce).format('0,0')}
                </p>
            }
            sim={
                <p className="text-xs text-milk-600" title={`Simulation took ${validTradeValues.data.simulation.simulated_took_ms}ms`}>
                    {validTradeValues.data.simulation.simulated_took_ms}ms
                </p>
            }
            idx={
                hasValidTx && validTradeValues.data.broadcast ? (
                    <p
                        className={cn(
                            'text-xs font-medium',
                            validTradeValues.data.broadcast.receipt.transaction_index <= 5
                                ? 'text-aquamarine'
                                : validTradeValues.data.broadcast.receipt.transaction_index <= 10
                                  ? 'text-milk-600'
                                  : 'text-folly',
                        )}
                        title={`Transaction index in block: ${validTradeValues.data.broadcast.receipt.transaction_index}`}
                    >
                        {validTradeValues.data.broadcast.receipt.transaction_index}
                    </p>
                ) : (
                    <p className="text-xs text-milk-400">-</p>
                )
            }
            tx={
                hasValidTx ? (
                    <LinkToExplorer chainId={trade.Instance.Configuration?.chainId} txHash={txHash} className="hover:underline">
                        <p className="text-sm">{shortenValue(txHash)}</p>
                    </LinkToExplorer>
                ) : (
                    <p className="text-xs text-milk-400">-</p>
                )
            }
            className={cn('px-4 py-3 hover:bg-milk-100 transition-colors duration-200', className)}
        />
    )
})

// Validation function (reused from RecentTradesList)
function isValidTradePattern(tradeValues: unknown): tradeValues is TradeValuesV2 {
    try {
        const values = tradeValues as { data?: unknown; identifier?: unknown }
        if (!values?.data || !values?.identifier) return false

        const data = values.data as {
            status?: string
            context?: unknown
            metadata?: {
                base_token?: string
                quote_token?: string
                profit_delta_bps?: number
                amount_in_normalized?: number
                amount_out_expected?: number
            }
            inventory?: unknown
            simulation?: unknown
            broadcast?: unknown
        }

        if (!data.status || !data.context || !data.metadata || !data.inventory || !data.simulation) return false
        if (!['BroadcastSucceeded', 'SimulationFailed'].includes(data.status)) return false
        if (data.status === 'BroadcastSucceeded' && !data.broadcast) return false
        if (data.status === 'SimulationFailed' && data.broadcast !== null) return false
        if (
            !data.metadata.base_token ||
            !data.metadata.quote_token ||
            data.metadata.profit_delta_bps === undefined ||
            data.metadata.amount_in_normalized === undefined ||
            data.metadata.amount_out_expected === undefined
        )
            return false

        return true
    } catch {
        return false
    }
}

/**
 * Strategy trades list component - reuses components from RecentTradesList
 */
export function StrategyTradesList(props: { trades: TradeWithInstanceAndConfiguration[]; isLoading: boolean }) {
    const { trades, isLoading } = props

    // Filter trades that match the expected pattern
    const validTrades = trades.filter((trade) => {
        if (!trade.Instance.Configuration) return false
        const tradeValues = trade.values as unknown
        return isValidTradePattern(tradeValues)
    })

    // easy ternary
    const showLoading = isLoading && validTrades?.length === 0
    const noData = !isLoading && validTrades?.length === 0

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
                            {validTrades.map((trade, tradeIndex) => (
                                <RecentTradeRow key={`${trade.id}-${tradeIndex}`} trade={trade} className="border-t border-milk-100" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

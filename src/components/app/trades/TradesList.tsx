'use client'

import { ReactNode, memo } from 'react'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import { cn, DAYJS_FORMATS, shortenValue } from '@/utils'
import { EmptyPlaceholder } from '../shared/PlaceholderTemplates'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { LiveDate } from '@/components/common/LiveDate'
import { Tag, TradeSide } from '@/components/figma/Tags'
import { ChainImage, SymbolImage } from '@/components/common/ImageWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import numeral from 'numeral'
import { RoundedAmount } from '@/components/common/RoundedAmount'
import { TradeValuesV2, isSuccessfulTrade, isRevertedTrade, isSimulationFailedTrade } from '@/interfaces/database/trade.interface'
import LinkWrapper from '@/components/common/LinkWrapper'
import { jsonConfigParser } from '@/utils/data/parser'
import { LinkToExplorer } from '@/components/common/LinkToExplorer'
import { DEFAULT_PADDING_X } from '@/config'
import StyledTooltip from '@/components/common/StyledTooltip'

/**
 * ------------------------ 1 template
 */

export const TradeRowTemplate = (props: {
    strategy: ReactNode
    time: ReactNode
    status: ReactNode
    side: ReactNode
    chain: ReactNode
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
        <div className={cn('flex w-full items-center gap-1 text-sm', props.className)}>
            <div className="w-[170px]">{props.strategy}</div>
            <div className="w-[120px]">{props.time}</div>
            <div className="flex w-[70px] justify-center">{props.status}</div>
            <div className="w-[70px]">{props.side}</div>
            <div className="w-[110px]">{props.chain}</div>
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

export function TradesTableHeaders() {
    return (
        <TradeRowTemplate
            strategy={<p className="pl-2">Strategy</p>}
            time={<p className="truncate">Time</p>}
            status={<p className="truncate">Status</p>}
            side={<p className="truncate">Side</p>}
            chain={<p className="truncate">Chain</p>}
            volume={<p className="truncate">Volume</p>}
            in={<p className="truncate">In</p>}
            out={<p className="truncate">Out</p>}
            profit={<p className="truncate">Profit (bps)</p>}
            gas={<p className="truncate">Gas</p>}
            nonce={<p className="truncate">Nonce</p>}
            sim={<p className="truncate">Simulation (ms)</p>}
            idx={<p className="truncate">Index</p>}
            tx={<p className="truncate">Tx</p>}
            className="px-4 py-3 text-xs text-milk-600"
        />
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingTradeRows() {
    const loadingParagraph = <p className="skeleton-loading mr-auto h-8 w-3/4 rounded-lg">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {Array.from({ length: 8 }, (_, i) => (
                    <TradeRowTemplate
                        key={i}
                        strategy={loadingParagraph}
                        time={loadingParagraph}
                        status={loadingParagraph}
                        side={loadingParagraph}
                        chain={loadingParagraph}
                        volume={loadingParagraph}
                        in={loadingParagraph}
                        out={loadingParagraph}
                        profit={loadingParagraph}
                        gas={loadingParagraph}
                        nonce={loadingParagraph}
                        sim={loadingParagraph}
                        idx={loadingParagraph}
                        tx={loadingParagraph}
                        className="rounded-lg border-b border-milk-50 py-2 text-transparent"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * ------------------------ 4 validation utilities
 */

function isValidTradePattern(tradeValues: unknown): tradeValues is TradeValuesV2 {
    try {
        // Check basic structure
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

        // Check required fields
        if (!data.status || !data.context || !data.metadata || !data.inventory || !data.simulation) return false

        // Check status is one of expected values
        if (!['BroadcastSucceeded', 'SimulationFailed'].includes(data.status)) return false

        // If BroadcastSucceeded, must have broadcast data
        if (data.status === 'BroadcastSucceeded' && !data.broadcast) return false

        // If SimulationFailed, broadcast should be null
        if (data.status === 'SimulationFailed' && data.broadcast !== null) return false

        // Check metadata has required fields
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
//         // const blockDelta = tradeValues.data.broadcast.receipt.block_number - tradeValues.data.context.block
//         return `Success`
//         // return `Success - Gas: ${numeral(tradeValues.data.broadcast.receipt.gas_used).format('0,0')} | Block +${blockDelta} | Index: ${tradeValues.data.broadcast.receipt.transaction_index}`
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

export const TradeRow = memo(function TradeRow({ trade, className }: { trade: TradeWithInstanceAndConfiguration; className?: string }) {
    if (!trade.Instance.Configuration) return null

    // Validate trade pattern
    const tradeValues = trade.values as unknown
    if (!isValidTradePattern(tradeValues)) return null

    const validTradeValues = tradeValues as TradeValuesV2
    const parsedConfig = jsonConfigParser(trade.Instance.Configuration.id, trade.Instance.Configuration.values)
    const spread = parsedConfig.execution.minSpreadThresholdBps || 0

    // Get tx hash based on trade type
    const txHash = validTradeValues.data.broadcast?.hash ?? ''
    const isReverted = isRevertedTrade(validTradeValues)
    const hasValidTx = txHash && txHash.startsWith('0x')

    // Calculate gas cost in USD
    const gasCostUsd = validTradeValues.data.metadata.gas_cost_usd

    // Calculate volume in USD
    // For stablecoin pairs (USDC/DAI), the amount is already in USD
    // For ETH pairs, we need to multiply by the ETH price
    const baseToken = validTradeValues.data.metadata.base_token.toUpperCase()
    const quoteToken = validTradeValues.data.metadata.quote_token.toUpperCase()
    let volumeUsd = 0

    if (baseToken === 'WETH' || baseToken === 'ETH') {
        // ETH is base token, multiply by ETH price
        volumeUsd = validTradeValues.data.metadata.amount_in_normalized * validTradeValues.data.metadata.reference_price
    } else if (quoteToken === 'WETH' || quoteToken === 'ETH') {
        // ETH is quote token, amount_in is already in USD (USDC)
        volumeUsd = validTradeValues.data.metadata.amount_in_normalized
    } else {
        // Stablecoin pairs, amount is in USD
        volumeUsd = validTradeValues.data.metadata.amount_in_normalized
    }

    return (
        <TradeRowTemplate
            strategy={
                <LinkWrapper
                    href={`/strategies/${parsedConfig.id}`}
                    target="_blank"
                    className="group flex w-fit cursor-alias items-center gap-2 rounded-lg"
                >
                    <p className="truncate font-medium group-hover:underline">
                        {trade.Instance.Configuration?.baseTokenSymbol.toUpperCase()} / {trade.Instance.Configuration?.quoteTokenSymbol.toUpperCase()}
                    </p>
                    <Tag variant="default" className="rounded py-0.5 pl-2 pr-1.5 text-xs">
                        <p className="text-milk">{numeral(spread).format('0,0.[0000]')} bps</p>
                    </Tag>
                </LinkWrapper>
            }
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
                    <p className="mx-auto w-4 cursor-help">{getTradeStatusIcon(validTradeValues)}</p>
                </StyledTooltip>
            }
            side={<TradeSide side={validTradeValues.data.metadata.trade_direction === 'Buy' ? 'buy' : 'sell'} />}
            chain={
                <div className="flex items-center gap-2">
                    <ChainImage id={trade.Instance.Configuration?.chainId} size={20} />
                    <p className="truncate">{CHAINS_CONFIG[trade.Instance.Configuration?.chainId]?.name || 'Unknown'}</p>
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
                    <p className="cursor-help text-sm text-milk">${numeral(gasCostUsd).format('0,0.[00]')}</p>
                </StyledTooltip>
            }
            nonce={
                <p className="text-sm text-milk" title={`Transaction nonce: ${validTradeValues.data.inventory.nonce}`}>
                    {numeral(validTradeValues.data.inventory.nonce).format('0,0')}
                </p>
            }
            sim={
                <p className="text-xs text-milk" title={`Simulation took ${validTradeValues.data.simulation.simulated_took_ms}ms`}>
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
                                  ? 'text-milk'
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
            className={cn('px-4 py-3 transition-colors duration-200 hover:bg-milk-100', className)}
        />
    )
})
/**
 * ------------------------ 6 list
 */

export function TradesList() {
    const { trades, isLoading } = useTradesData()

    // Filter trades that match the expected pattern
    const validTrades = trades.filter((trade) => {
        if (!trade.Instance.Configuration) return false
        const tradeValues = trade.values as unknown
        return isValidTradePattern(tradeValues)
    })

    // Calculate total volume
    // const totalVolume = validTrades.reduce((sum, trade) => {
    //     const tradeValues = trade.values as unknown
    //     if (isValidTradePattern(tradeValues)) {
    //         const validValues = tradeValues as TradeValuesV2
    //         const baseToken = validValues.data.metadata.base_token.toUpperCase()
    //         const quoteToken = validValues.data.metadata.quote_token.toUpperCase()
    //         let volume = 0

    //         if (baseToken === 'WETH' || baseToken === 'ETH') {
    //             // ETH is base token, multiply by ETH price
    //             volume = validValues.data.metadata.amount_in_normalized * validValues.data.metadata.reference_price
    //         } else if (quoteToken === 'WETH' || quoteToken === 'ETH') {
    //             // ETH is quote token, amount_in is already in USD (USDC)
    //             volume = validValues.data.metadata.amount_in_normalized
    //         } else {
    //             // Stablecoin pairs, amount is in USD
    //             volume = validValues.data.metadata.amount_in_normalized
    //         }

    //         return sum + volume
    //     }
    //     return sum
    // }, 0)

    // easy ternary
    const showLoading = isLoading && validTrades?.length === 0
    const noData = !isLoading && validTrades?.length === 0

    // render table
    return (
        <div className={cn('rounded-xl', DEFAULT_PADDING_X)}>
            <div className={cn('w-full overflow-x-auto')}>
                <div className={cn('flex max-h-[50vh] w-full min-w-max flex-col rounded-2xl bg-milk-50')}>
                    <TradesTableHeaders />
                    {showLoading ? (
                        <LoadingTradeRows />
                    ) : noData ? (
                        <EmptyPlaceholder entryName="trades" />
                    ) : (
                        <div className="flex flex-col overflow-y-auto">
                            {validTrades.map((trade, tradeIndex) => (
                                <TradeRow key={`${trade.id}-${tradeIndex}`} trade={trade} className="border-t border-milk-100" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

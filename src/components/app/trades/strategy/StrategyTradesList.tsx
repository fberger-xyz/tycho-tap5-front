'use client'

import { EmptyPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import { SymbolImage } from '@/components/common/ImageWrapper'
import { LinkToExplorer } from '@/components/common/LinkToExplorer'
import { LiveDate } from '@/components/common/LiveDate'
import { RoundedAmount } from '@/components/common/RoundedAmount'
import StyledTooltip from '@/components/common/StyledTooltip'
import { TradeSide } from '@/components/figma/Tags'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { type TradeValuesV2, isRevertedTrade, isSimulationFailedTrade, isSuccessfulTrade } from '@/interfaces/database/trade.interface'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { DAYJS_FORMATS, cn, mapProtocolIdToProtocolConfig, shortenValue } from '@/utils'
import numeral from 'numeral'
import { ReactNode, memo } from 'react'
import { toast } from 'react-hot-toast'
import PoolLink from '@/components/app/pools/LinkToPool'

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
    spotPrice: ReactNode
    refPrice: ReactNode
    gas: ReactNode
    nonce: ReactNode
    sim: ReactNode
    broadcast: ReactNode
    idx: ReactNode
    tx: ReactNode
    raw: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('flex w-full items-center gap-1 text-sm', props.className)}>
            <div className="w-[130px]">{props.time}</div>
            <div className="w-[130px]">{props.pool}</div>
            <div className="flex w-[70px] justify-center">{props.status}</div>
            <div className="w-[70px]">{props.side}</div>
            <div className="w-[70px]">{props.volume}</div>
            <div className="w-[105px]">{props.in}</div>
            <div className="w-[105px]">{props.out}</div>
            <div className="w-[90px]">{props.profit}</div>
            <div className="w-[80px]">{props.spotPrice}</div>
            <div className="w-[80px]">{props.refPrice}</div>
            <div className="w-[65px]">{props.gas}</div>
            <div className="w-[65px]">{props.nonce}</div>
            <div className="w-[100px]">{props.sim}</div>
            <div className="w-[85px]">{props.broadcast}</div>
            <div className="w-[55px]">{props.idx}</div>
            <div className="w-[80px]">{props.tx}</div>
            <div className="w-[65px]">{props.raw}</div>
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
            profit={<p className="truncate">Net spread (bps)</p>}
            spotPrice={<p className="truncate">Spot Price</p>}
            refPrice={<p className="truncate">Ref Price</p>}
            gas={<p className="truncate">Gas</p>}
            nonce={<p className="truncate">Nonce</p>}
            sim={<p className="truncate">Simulation (ms)</p>}
            broadcast={<p className="truncate">Broadcast (ms)</p>}
            idx={<p className="truncate">Index</p>}
            tx={<p className="truncate">Tx</p>}
            raw={<p className="truncate">Raw</p>}
            className="px-4 py-3 text-xs text-milk-600"
        />
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingRecentTradeRows() {
    const loadingParagraph = <p className="skeleton-loading mr-auto h-8 w-3/4 rounded-lg">Loading...</p>
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
                        spotPrice={loadingParagraph}
                        refPrice={loadingParagraph}
                        gas={loadingParagraph}
                        nonce={loadingParagraph}
                        sim={loadingParagraph}
                        broadcast={loadingParagraph}
                        idx={loadingParagraph}
                        tx={loadingParagraph}
                        raw={loadingParagraph}
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
                    <div className="mx-auto w-4 cursor-help">{getTradeStatusIcon(validTradeValues)}</div>
                </StyledTooltip>
            }
            side={<TradeSide side={validTradeValues.data.metadata.trade_direction === 'Buy' ? 'buy' : 'sell'} />}
            pool={
                // <div className="flex items-center gap-2">
                //     <FileMapper
                //         id={getProtocolConfig(trade.Instance.Configuration.values as string).fileId}
                //         className="size-6 rounded-full bg-milk-100"
                //     />
                //     <LinkWrapper
                //         href={`${CHAINS_CONFIG[parsedConfig.chain.id].explorerRoot}/contract/${poolAddress}`}
                //         className="truncate hover:underline cursor-alias"
                //         target="_blank"
                //         rel="noopener noreferrer"
                //     >
                //         {shortenValue(poolAddress)}
                //     </LinkWrapper>
                // </div>
                <PoolLink
                    currentChainId={trade.Instance.Configuration?.chainId}
                    pool={{
                        address: poolAddress,
                        id: 'string',
                        tokens: [
                            {
                                address: 'string',
                                decimals: 18,
                                symbol: 'string',
                                gas: 'string',
                            },
                        ],
                        protocol_system: 'string',
                        contract_ids: ['string'],
                        static_attributes: [['string']],
                        creation_tx: 'string',
                        fee: 30,
                        last_updated_at: 100,
                        protocol_type_name: 'string',
                    }}
                    config={mapProtocolIdToProtocolConfig('uniswap v3')}
                />
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
                        {numeral(validTradeValues.data.metadata.amount_in_normalized).format('0,0.[000]')}
                    </RoundedAmount>
                </div>
            }
            out={
                <div className="flex items-center gap-2">
                    <SymbolImage symbol={validTradeValues.data.metadata.quote_token} size={20} />
                    <RoundedAmount amount={validTradeValues.data.metadata.amount_out_expected}>
                        {numeral(validTradeValues.data.metadata.amount_out_expected).format('0,0.[000]')}
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
            spotPrice={
                <p className="text-sm text-milk" title={`Spot price: ${validTradeValues.data.metadata.spot_price}`}>
                    {numeral(validTradeValues.data.metadata.spot_price).format('0,0.[0000]')}
                </p>
            }
            refPrice={
                <p className="text-sm text-milk" title={`Reference price: ${validTradeValues.data.metadata.reference_price}`}>
                    {numeral(validTradeValues.data.metadata.reference_price).format('0,0.[00]')}
                </p>
            }
            gas={
                <StyledTooltip
                    content={
                        <div className="flex flex-col gap-1">
                            <p>Gas cost: ${numeral(gasCostUsd).format('0,0.000000')}</p>
                            <p>Gas used: {numeral(validTradeValues.data.broadcast?.receipt?.gas_used).format('0,0')}</p>
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
                validTradeValues.data.simulation ? (
                    <p className="text-sm text-milk" title={`Simulation took ${validTradeValues.data.simulation.simulated_took_ms}ms`}>
                        {validTradeValues.data.simulation.simulated_took_ms} ms
                    </p>
                ) : (
                    <p className="text-xs text-milk-400">-</p>
                )
            }
            broadcast={
                validTradeValues.data.broadcast?.broadcasted_took_ms ? (
                    <p className="text-sm text-milk" title={`Broadcast took ${validTradeValues.data.broadcast.broadcasted_took_ms}ms`}>
                        {numeral(validTradeValues.data.broadcast.broadcasted_took_ms).format('0,0')} ms
                    </p>
                ) : (
                    <p className="text-xs text-milk-400">-</p>
                )
            }
            idx={
                hasValidTx && validTradeValues.data.broadcast?.receipt ? (
                    <StyledTooltip
                        content={
                            <div className="flex flex-col gap-1">
                                <p>Position in block: {validTradeValues.data.broadcast.receipt.transaction_index}</p>
                                <div className="mt-1 text-xs opacity-80">
                                    {validTradeValues.data.broadcast.receipt.transaction_index <= 5 ? (
                                        <span className="text-aquamarine">Top 5 position</span>
                                    ) : validTradeValues.data.broadcast.receipt.transaction_index <= 10 ? (
                                        <span className="text-milk">Top 10 position</span>
                                    ) : (
                                        <span className="text-folly">Late</span>
                                    )}
                                </div>
                            </div>
                        }
                    >
                        <p
                            className={cn(
                                'cursor-help font-medium',
                                validTradeValues.data.broadcast.receipt.transaction_index <= 5
                                    ? 'text-aquamarine'
                                    : validTradeValues.data.broadcast.receipt.transaction_index <= 10
                                      ? 'text-milk'
                                      : 'text-folly',
                            )}
                        >
                            {validTradeValues.data.broadcast.receipt.transaction_index}
                        </p>
                    </StyledTooltip>
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
            raw={
                <StyledTooltip
                    content={
                        <div className="flex flex-col gap-1">
                            <pre>{JSON.stringify(trade.values, null, 2)}</pre>
                        </div>
                    }
                >
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(trade.values, null, 2))
                            toast.success('Copied to clipboard')
                        }}
                        className="flex cursor-pointer items-center gap-1"
                    >
                        <IconWrapper id={IconIds.COPY} className="size-4 text-milk group-hover:text-milk" />
                    </button>
                </StyledTooltip>
            }
            className={cn('px-4 py-3 transition-colors duration-200 hover:bg-milk-100', className)}
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

        // simulation can be null when skip_simulation is enabled (mainnet)
        if (!data.status || !data.context || !data.metadata || !data.inventory) return false
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

    // filter trades that match the expected pattern and are successful (status: true)
    const validTrades = trades.filter((trade) => {
        if (!trade.Instance.Configuration) return false
        if (!isValidTradePattern(trade.values as unknown)) return false
        return isSuccessfulTrade(trade.values as unknown as TradeValuesV2)
    })

    // easy ternary
    const showLoading = isLoading && validTrades?.length === 0
    const noData = !isLoading && validTrades?.length === 0

    // render table
    return (
        <div className="w-full rounded-xl">
            <div className="w-full overflow-x-auto">
                <div className={cn('flex max-h-[50vh] w-full min-w-max flex-col')}>
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

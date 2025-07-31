'use client'

import { LoadingTradeRows as LoadingRows } from './TradesList'
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
import { TradeValues } from '@/interfaces/database/trade.interface'
import LinkWrapper from '@/components/common/LinkWrapper'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { jsonConfigParser } from '@/utils/data/parser'
import { LinkToExplorer } from '@/components/common/LinkToExplorer'

/**
 * ------------------------ 1 template
 */

export const CELL_WIDTHS = {
    strategy: 200,
    time: 100,
    side: 60,
    chain: 120,
    in: 90,
    out: 90,
    price: 90,
    tx: 60,
}

export const TradeRowTemplate = (props: {
    strategy: ReactNode
    time: ReactNode
    side: ReactNode
    chain: ReactNode
    in: ReactNode
    out: ReactNode
    price: ReactNode
    tx: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('flex items-center text-sm gap-1', props.className)}>
            <div className={`w-[${CELL_WIDTHS.strategy}px]`}>{props.strategy}</div>
            <div className={`w-[${CELL_WIDTHS.time}px]`}>{props.time}</div>
            <div className={`w-[${CELL_WIDTHS.side}px]`}>{props.side}</div>
            <div className={`w-[${CELL_WIDTHS.chain}px]`}>{props.chain}</div>
            <div className={`w-[${CELL_WIDTHS.in}px]`}>{props.in}</div>
            <div className={`w-[${CELL_WIDTHS.out}px]`}>{props.out}</div>
            <div className={`w-[${CELL_WIDTHS.price}px]`}>{props.price}</div>
            <div className={`w-[${CELL_WIDTHS.tx}px]`}>{props.tx}</div>
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
            time={<p>Time</p>}
            side={<p>Side</p>}
            chain={<p>Chain</p>}
            in={<p>In</p>}
            out={<p>Out</p>}
            price={<p>Price</p>}
            tx={<p>Tx</p>}
            className="px-4 py-3 text-milk-400 text-xs"
        />
    )
}

/**
 * ------------------------ 3 loading
 */

export function LoadingTradeRows() {
    const loadingParagraph = <p className="w-3/4 skeleton-loading h-6 rounded-full">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {Array.from({ length: 8 }, (_, i) => (
                    <TradeRowTemplate
                        key={i}
                        strategy={loadingParagraph}
                        time={loadingParagraph}
                        side={loadingParagraph}
                        chain={loadingParagraph}
                        in={loadingParagraph}
                        out={loadingParagraph}
                        price={loadingParagraph}
                        tx={loadingParagraph}
                        className="px-3 py-2 rounded-lg text-transparent border-b border-milk-50"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * ------------------------ 4 content
 */

export const TradeRow = memo(function TradeRow({ trade, className }: { trade: TradeWithInstanceAndConfiguration; className?: string }) {
    if (!trade.Instance.Configuration) return null
    const parsedConfig = jsonConfigParser(trade.Instance.Configuration.values)
    const tradeValues = trade.values as unknown as TradeValues
    const spread = parsedConfig.execution.minSpreadThresholdBps || 0
    const txHash = tradeValues.data?.broadcast?.hash ?? ''
    if (!txHash || !txHash.startsWith('0x')) return null
    // console.log({ trade, configValues: trade.Instance.Configuration.values, parsedConfig })
    return (
        <TradeRowTemplate
            strategy={
                <LinkWrapper
                    href={`/strategies/${trade.id}`}
                    target="_blank"
                    className="flex gap-2 items-center hover:bg-milk-100 w-fit px-3 py-2 rounded-lg group cursor-pointer"
                >
                    <p className="font-medium truncate">
                        {trade.Instance.Configuration?.baseTokenSymbol.toUpperCase()} / {trade.Instance.Configuration?.quoteTokenSymbol.toUpperCase()}
                    </p>
                    <Tag variant="default" className="rounded pl-2 pr-1.5 py-0.5 text-xs">
                        <p className="text-milk-600">{numeral(spread).format('0,0.[0000]')} bps</p>
                    </Tag>
                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4 text-transparent group-hover:text-aquamarine" />
                </LinkWrapper>
            }
            time={<LiveDate date={trade.createdAt}>{DAYJS_FORMATS.timeAgo(trade.createdAt)}</LiveDate>}
            side={<TradeSide side={trade.Instance.Configuration?.baseTokenSymbol.toLowerCase() === 'eth' ? 'buy' : 'sell'} />}
            chain={
                <div className="flex gap-2 items-center">
                    <ChainImage id={trade.Instance.Configuration?.chainId} size={20} />
                    <p className="truncate">{CHAINS_CONFIG[trade.Instance.Configuration?.chainId]?.name || 'Unknown'}</p>
                </div>
            }
            in={
                <div className="flex items-center gap-2">
                    <SymbolImage symbol={tradeValues.data.metadata.base_token} size={20} />
                    <RoundedAmount amount={tradeValues.data.metadata.amount_in_normalized}>
                        {numeral(tradeValues.data.metadata.amount_in_normalized).format('0,0.[000]')}
                    </RoundedAmount>
                </div>
            }
            out={
                <div className="flex items-center gap-2">
                    <SymbolImage symbol={tradeValues.data.metadata.quote_token} size={20} />
                    <RoundedAmount amount={tradeValues.data.metadata.amount_out_expected}>
                        {numeral(tradeValues.data.metadata.amount_out_expected).format('0,0.[000]')}
                    </RoundedAmount>
                </div>
            }
            price={<p>{numeral(tradeValues.data.metadata.reference_price).format('0,0.[0]')}</p>}
            tx={
                <LinkToExplorer chainId={trade.Instance.Configuration?.chainId} txHash={txHash} className="col-span-5 hover:underline">
                    <p>{shortenValue(txHash)}</p>
                </LinkToExplorer>
            }
            className={cn('px-4 py-3 hover:bg-milk-100 transition-colors duration-200', className)}
        />
    )
})
/**
 * ------------------------ 5 list
 */

export function TradesList() {
    const { trades, isLoading } = useTradesData()

    // easy ternary
    const showLoading = isLoading && trades?.length === 0
    const noData = !isLoading && trades?.length === 0

    // render table
    return (
        <div className="rounded-xl w-full">
            <div className="overflow-x-auto w-full">
                <div className="flex flex-col min-w-max rounded-2xl bg-milk-50 max-h-[50vh] w-full">
                    <TradesTableHeaders />
                    {showLoading ? (
                        <LoadingRows />
                    ) : noData ? (
                        <EmptyPlaceholder entryName="trades" />
                    ) : (
                        <div className="flex flex-col overflow-y-auto">
                            {trades.map((trade, tradeIndex) => (
                                <TradeRow key={`${trade.id}-${tradeIndex}`} trade={trade} className="border-t border-milk-100" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

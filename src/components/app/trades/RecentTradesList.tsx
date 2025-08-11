'use client'

import { ReactNode, memo } from 'react'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import { cn, DAYJS_FORMATS, shortenValue } from '@/utils'
import { EmptyPlaceholder } from '../shared/PlaceholderTemplates'
import { TradeWithInstanceAndConfiguration } from '@/types'
import { LiveDate } from '@/components/common/LiveDate'
import { TradeSide } from '@/components/figma/Tags'
import { SymbolImage } from '@/components/common/ImageWrapper'
import numeral from 'numeral'
import { RoundedAmount } from '@/components/common/RoundedAmount'
import { TradeValues } from '@/interfaces/database/trade.interface'
import { LinkToExplorer } from '@/components/common/LinkToExplorer'
import { CHAINS_CONFIG, DEFAULT_PADDING_X, getProtocolConfig } from '@/config'
import FileMapper from '@/components/icons/FileMapper'
import { jsonConfigParser } from '@/utils/data/parser'
import LinkWrapper from '@/components/common/LinkWrapper'
import UsdAmount from '@/components/figma/UsdAmount'

// todo simulation failed pas de broadcast data

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

export const RecentTradeRowTemplate = (props: {
    protocol: ReactNode
    time: ReactNode
    side: ReactNode
    in: ReactNode
    out: ReactNode
    price: ReactNode
    tx: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('flex w-full items-center text-sm gap-1', props.className)}>
            <div className={`w-[60px]`}>{props.side}</div>
            <div className={`w-[180px]`}>{props.protocol}</div>
            <div className={`w-[90px]`}>{props.in}</div>
            <div className={`w-[90px]`}>{props.out}</div>
            <div className={`w-[90px]`}>{props.price}</div>
            <div className={`w-[130px]`}>{props.time}</div>
            <div className={`w-[60px]`}>{props.tx}</div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function RecentTradesTableHeaders() {
    return (
        <RecentTradeRowTemplate
            side={<p className="pl-2">Side</p>}
            protocol={<p>Protocol</p>}
            in={<p>In</p>}
            out={<p>Out</p>}
            price={<p>Price</p>}
            time={<p>Time</p>}
            tx={<p>Tx</p>}
            className="px-4 py-3 text-milk-400 text-xs"
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
                        protocol={loadingParagraph}
                        time={loadingParagraph}
                        side={loadingParagraph}
                        in={loadingParagraph}
                        out={loadingParagraph}
                        price={loadingParagraph}
                        tx={loadingParagraph}
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

export const RecentTradeRow = memo(function RecentTradeRow({ trade, className }: { trade: TradeWithInstanceAndConfiguration; className?: string }) {
    if (!trade.Instance.Configuration) return null
    const tradeValues = trade.values as unknown as TradeValues
    const txHash = tradeValues.data?.broadcast?.hash ?? ''
    if (!txHash || !txHash.startsWith('0x')) return null
    const parsedConfig = jsonConfigParser(trade.Instance.Configuration.id, trade.Instance.Configuration.values)
    const poolAddress = tradeValues.data.metadata?.pool ?? 'Unknown'
    return (
        <RecentTradeRowTemplate
            protocol={
                <div className="flex items-center gap-2 pl-2">
                    <FileMapper
                        id={getProtocolConfig(trade.Instance.Configuration.values as string).fileId}
                        className="size-6 rounded-full bg-milk-100"
                    />
                    {/* <p className="truncate">{getProtocolConfig(trade.Instance.Configuration.values as string).name}</p> */}
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
            time={<LiveDate date={trade.createdAt}>{DAYJS_FORMATS.timeAgo(trade.createdAt)}</LiveDate>}
            side={<TradeSide side={trade.Instance.Configuration?.baseTokenSymbol.toLowerCase() === 'eth' ? 'buy' : 'sell'} />}
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
            price={<UsdAmount amountUsd={tradeValues.data.metadata.reference_price} textClassName="text-sm font-normal" />}
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

export function RecentTradesList() {
    const { trades, isLoading } = useTradesData()

    // easy ternary
    const showLoading = isLoading && trades?.length === 0
    const noData = !isLoading && trades?.length === 0

    // render table
    return (
        <div className="rounded-xl w-full">
            <div className={cn('overflow-x-auto w-full', DEFAULT_PADDING_X)}>
                <div className={cn('flex flex-col min-w-max rounded-2xl bg-milk-50 max-h-[50vh] w-full')}>
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

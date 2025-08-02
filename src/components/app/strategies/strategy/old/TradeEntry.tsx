'use client'

import { Trade } from '@prisma/client'
import { TradeValues } from '@/interfaces'
import { AppSupportedChainIds } from '@/enums'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { cn, DAYJS_FORMATS, shortenValue } from '@/utils'
import { SymbolImage } from '@/components/common/ImageWrapper'
import { LiveDate } from '@/components/common/LiveDate'
import numeral from 'numeral'
import { RoundedAmount } from '@/components/common/RoundedAmount'
import StyledTooltip from '@/components/common/StyledTooltip'

export function TradeEntryTemplate(props: {
    when: React.ReactNode
    tx: React.ReactNode
    amountIn: React.ReactNode
    amountOut: React.ReactNode
    price: React.ReactNode
    info: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('grid grid-cols-7 gap-2 text-xs pl-1', props.className)}>
            <div className="col-span-2">{props.when}</div>
            <div className="col-span-1">{props.amountOut}</div>
            <div className="col-span-1">{props.amountIn}</div>
            <div className="col-span-1">{props.price}</div>
            <div className="col-span-1">{props.tx}</div>
            <div className="col-span-1">{props.info}</div>
        </div>
    )
}

export function TradeEntryHeader() {
    return (
        <TradeEntryTemplate
            when={<p>Date</p>}
            amountIn={<p>In</p>}
            amountOut={<p>Out</p>}
            price={<p>Price</p>}
            tx={<p>Tx</p>}
            info={null}
            className="text-milk-200"
        />
    )
}

// https://github.com/0xMerso/tycho-market-maker/blob/067022dbedf9e3c797b8e82fa3d7e24d13ee2c68/src/shd/types/maker.rs#L183
export function TradeEntry({ trade, chain, index }: { trade: Trade; chain: AppSupportedChainIds; index: number }) {
    const castedValues = trade.values as unknown as TradeValues
    return (
        <TradeEntryTemplate
            key={trade.id}
            when={
                <div className="flex items-center gap-1">
                    <p className="text-milk-200 w-4">{index + 1}.</p>
                    <LiveDate date={trade.createdAt}>{DAYJS_FORMATS.timeAgo(trade.createdAt)}</LiveDate>
                </div>
            }
            tx={
                <LinkWrapper
                    href={`${CHAINS_CONFIG[chain].explorerRoot}/tx/${castedValues.data.broadcast.hash}`}
                    target="_blank"
                    className="col-span-5 hover:underline"
                >
                    <p>{shortenValue(castedValues.data.broadcast.hash || 'no tx')}</p>
                </LinkWrapper>
            }
            amountIn={
                <div className="flex items-center gap-1">
                    <SymbolImage
                        symbol={castedValues.data.metadata.base_token}
                        size={16}
                        className="grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    <RoundedAmount amount={castedValues.data.metadata.amount_in_normalized}>
                        {numeral(castedValues.data.metadata.amount_in_normalized).format('0,0.00')}
                    </RoundedAmount>
                </div>
            }
            amountOut={
                <div className="flex items-center gap-1">
                    <SymbolImage
                        symbol={castedValues.data.metadata.quote_token}
                        size={16}
                        className="grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    <RoundedAmount amount={castedValues.data.metadata.amount_out_expected}>
                        {numeral(castedValues.data.metadata.amount_out_expected).format('0,0.00')}
                    </RoundedAmount>
                </div>
            }
            price={<p>{numeral(castedValues.data.metadata.reference_price).format('0,0')}</p>}
            info={
                <StyledTooltip key={trade.id} content={<pre className="text-xs">{JSON.stringify(trade.values, null, 2)}</pre>}>
                    <p>Data</p>
                </StyledTooltip>
            }
            className="text-milk-400 hover:text-milk group"
        />
    )
}

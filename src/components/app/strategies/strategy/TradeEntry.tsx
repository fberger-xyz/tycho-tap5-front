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
    index: React.ReactNode
    when: React.ReactNode
    tx: React.ReactNode
    description: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('grid grid-cols-12 text-xs', props.className)}>
            <div className="col-span-1">{props.index}</div>
            <div className="col-span-2">{props.when}</div>
            <div className="col-span-2">{props.tx}</div>
            <div className="col-span-7">{props.description}</div>
        </div>
    )
}

export function TradeEntryHeader() {
    return <TradeEntryTemplate index={<p>#</p>} when={<p>When</p>} tx={<p>Tx</p>} description={<p>Description</p>} className="opacity-30" />
}

// https://github.com/0xMerso/tycho-market-maker/blob/067022dbedf9e3c797b8e82fa3d7e24d13ee2c68/src/shd/types/maker.rs#L183
export function TradeEntry({ trade, chain, index }: { trade: Trade; chain: AppSupportedChainIds; index: number }) {
    const castedValues = trade.values as unknown as TradeValues
    return (
        <StyledTooltip key={trade.id} content={<pre className="text-xs">{JSON.stringify(trade.values, null, 2)}</pre>}>
            <TradeEntryTemplate
                index={<p className="opacity-50">{index + 1}</p>}
                when={<LiveDate date={trade.createdAt}>{DAYJS_FORMATS.timeAgo(trade.createdAt)}</LiveDate>}
                tx={
                    <LinkWrapper
                        href={`${CHAINS_CONFIG[chain].explorerRoot}/tx/${castedValues.data.broadcast.hash}`}
                        className="col-span-5 hover:underline"
                    >
                        <p>{shortenValue(castedValues.data.broadcast.hash || 'no tx')}</p>
                    </LinkWrapper>
                }
                description={
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1">
                            <p>Swap</p>
                            <RoundedAmount amount={castedValues.data.metadata.amount_in_normalized}>
                                {numeral(castedValues.data.metadata.amount_in_normalized).format('0,0.[000]')}
                            </RoundedAmount>
                        </div>
                        <SymbolImage symbol={castedValues.data.metadata.base_token} size={16} />
                        <div className="flex items-center gap-1">
                            <p>for</p>
                            <RoundedAmount amount={castedValues.data.metadata.amount_out_expected}>
                                {numeral(castedValues.data.metadata.amount_out_expected).format('0,0.[000]')}
                            </RoundedAmount>
                        </div>
                        <SymbolImage symbol={castedValues.data.metadata.quote_token} size={16} />
                        <p>at</p>
                        <p>{castedValues.data.metadata.reference_price}</p>
                        <div className="flex items-center">
                            <SymbolImage
                                symbol={
                                    castedValues.data.metadata.trade_direction === 'Sell'
                                        ? castedValues.data.metadata.quote_token
                                        : castedValues.data.metadata.base_token
                                }
                                size={16}
                            />
                            <SymbolImage
                                symbol={
                                    castedValues.data.metadata.trade_direction === 'Sell'
                                        ? castedValues.data.metadata.base_token
                                        : castedValues.data.metadata.quote_token
                                }
                                size={16}
                                className="-ml-3"
                            />
                        </div>
                    </div>
                }
            />
        </StyledTooltip>
    )
}

'use client'

import { ReactNode } from 'react'
import { cn, formatDateShort, getDurationBetween, shortenValue } from '@/utils'
import { memo } from 'react'
import { EnrichedInstance } from '@/types'
import { ChainImage, SymbolImage } from '@/components/common/ImageWrapper'
import { LiveDate } from '@/components/common/LiveDate'
import StyledTooltip from '@/components/common/StyledTooltip'
import { useAppStore } from '@/stores/app.store'
import { SupportedFilters, SupportedFilterDirections, IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'

/**
 * ------------------------ 1 template
 */

export const InstanceRowTemplate = (props: {
    index: ReactNode
    instance: ReactNode
    chain: ReactNode
    pair: ReactNode
    configurationId: ReactNode
    broadcast: ReactNode
    reference: ReactNode
    targetSpread: ReactNode
    startedAt: ReactNode
    endedAt: ReactNode
    duration: ReactNode
    trades: ReactNode
    eoa: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('w-full grid grid-cols-12 items-center text-sm gap-3', props.className)}>
            {/* A */}
            <div className="grid grid-cols-12 gap-3 items-center col-span-2">
                <div className="w-full col-span-2 pl-2">{props.index}</div>
                <div className="w-full col-span-4 mx-auto">{props.instance}</div>
                <div className="w-full col-span-3 mx-auto">{props.chain}</div>
                <div className="w-full col-span-3 mx-auto">{props.pair}</div>
            </div>

            {/* B */}
            <div className="grid grid-cols-12 gap-3 items-center col-span-4">
                <div className="w-full col-span-3 mx-auto">{props.configurationId}</div>
                <div className="w-full col-span-3 mx-auto capitalize">{props.broadcast}</div>
                <div className="w-full col-span-3 mx-auto capitalize">{props.reference}</div>
                <div className="w-full col-span-3 mx-auto">{props.targetSpread}</div>
            </div>

            {/* C */}
            <div className="grid grid-cols-12 gap-3 items-center col-span-6">
                <div className="w-full col-span-3 mx-auto">{props.startedAt}</div>
                <div className="w-full col-span-3 mx-auto">{props.endedAt}</div>
                <div className="w-full col-span-2 mx-auto">{props.duration}</div>
                <div className="w-full col-span-2 mx-auto">{props.trades}</div>
                <div className="w-full col-span-2 mx-auto">{props.eoa}</div>
            </div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

export function InstancesTableHeaders() {
    const { instancesSortedBy, sortInstancesBy, toggleFilterDirection, instancesSortedByFilterDirection } = useAppStore()
    const SortableHeader = ({ children, sortKey }: { children: ReactNode; sortKey?: SupportedFilters }) => {
        if (!sortKey) return <>{children}</>
        const isActive = instancesSortedBy === sortKey
        const isAscending = instancesSortedByFilterDirection === SupportedFilterDirections.ASCENDING
        return (
            <button
                onClick={() => {
                    if (isActive) toggleFilterDirection()
                    else sortInstancesBy(sortKey)
                }}
                className="flex items-center gap-1 hover:text-milk-300 transition-colors min-w-fit"
            >
                <span>{children}</span>
                <div className="flex flex-col w-5 h-8 relative">
                    <IconWrapper
                        id={IconIds.TRIANGLE_UP}
                        className={cn(
                            'size-5 absolute top-1 transition-opacity duration-200',
                            isActive && isAscending ? 'text-aquamarine opacity-100' : 'text-milk-400',
                        )}
                    />
                    <IconWrapper
                        id={IconIds.TRIANGLE_DOWN}
                        className={cn(
                            'size-5 absolute bottom-0.5 transition-opacity duration-200',
                            isActive && !isAscending ? 'text-aquamarine opacity-100' : 'text-milk-400',
                        )}
                    />
                </div>
            </button>
        )
    }

    return (
        <InstanceRowTemplate
            index={<p className="pl-2">#</p>}
            instance={<p>Instance</p>}
            chain={<p>Chain</p>}
            pair={<p>Pair</p>}
            configurationId={<p>Configuration</p>}
            broadcast={<p>Broadcast</p>}
            reference={<p>Reference</p>}
            targetSpread={<p>Target Spread</p>}
            startedAt={<SortableHeader sortKey={SupportedFilters.INSTANCE_STARTED}>Started At</SortableHeader>}
            endedAt={<SortableHeader sortKey={SupportedFilters.INSTANCE_ENDED}>Ended At</SortableHeader>}
            duration={<SortableHeader sortKey={SupportedFilters.RUNNING_TIME}>Duration</SortableHeader>}
            trades={<SortableHeader sortKey={SupportedFilters.TRADE_COUNT}>Trades</SortableHeader>}
            eoa={<p>EOA</p>}
            className="text-milk-200 px-4"
        />
    )
}

/**
 * ------------------------ 3 loading row
 */

export function LoadingInstanceRows() {
    const loadingParagraph = <p className="w-3/4 skeleton-loading h-6 rounded-lg">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {Array.from({ length: 8 }, (_, i) => (
                    <InstanceRowTemplate
                        key={i}
                        index={<p>{i + 1}</p>}
                        instance={loadingParagraph}
                        chain={loadingParagraph}
                        pair={loadingParagraph}
                        configurationId={loadingParagraph}
                        broadcast={loadingParagraph}
                        reference={loadingParagraph}
                        targetSpread={loadingParagraph}
                        startedAt={loadingParagraph}
                        endedAt={loadingParagraph}
                        duration={loadingParagraph}
                        trades={loadingParagraph}
                        eoa={loadingParagraph}
                        className="bg-milk-50 py-2 rounded-lg text-transparent"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * ------------------------ 4 content row
 */

export const InstanceRow = memo(function InstanceRow({ data, index }: { data: EnrichedInstance; index: number }) {
    const broadcast = data.config?.values.broadcast_url ? String(data.config?.values.broadcast_url) : 'unknown'
    const reference = data.config?.values.price_feed_config.source ? String(data.config?.values.price_feed_config.type) : 'unknown'
    const targetSpread = data.config?.values.target_spread_bps ? `${String(data.config?.values.target_spread_bps)} bps` : 'unknown'
    const eoa = data.config?.values.wallet_public_key ? String(data.config?.values.wallet_public_key) : ''
    return (
        <LinkWrapper href={`/instances/${data.instance.id}`} className="w-full">
            <InstanceRowTemplate
                index={<p className="text-milk-200">{index + 1}</p>}
                instance={
                    <StyledTooltip content={data.instance.id}>
                        <p>{shortenValue(data.instance.id)}</p>
                    </StyledTooltip>
                }
                chain={
                    <div className="flex gap-1 items-center">
                        <ChainImage id={data.chainId} size={22} />
                        {/* <p>{data.chain.name}</p> */}
                    </div>
                }
                pair={
                    <div className="flex gap-1 items-center">
                        <SymbolImage symbol={data.baseSymbol} size={22} />
                        <SymbolImage symbol={data.quoteSymbol} size={22} />
                    </div>
                }
                configurationId={
                    <StyledTooltip content={<pre className="text-xs">{JSON.stringify(data.config, null, 2)}</pre>}>
                        <div className="truncate" title={data.config.id}>
                            {shortenValue(data.config.id)}
                        </div>
                    </StyledTooltip>
                }
                broadcast={<p>{broadcast}</p>}
                reference={<p>{reference}</p>}
                targetSpread={<p>{targetSpread}</p>}
                startedAt={<LiveDate date={data.instance.startedAt}>{formatDateShort(data.instance.startedAt)}</LiveDate>}
                endedAt={
                    data.instance.endedAt ? (
                        <LiveDate date={data.instance.endedAt}>{formatDateShort(data.instance.endedAt)}</LiveDate>
                    ) : (
                        <p className="truncate">Running</p>
                    )
                }
                duration={
                    <div className="truncate">
                        {
                            getDurationBetween({
                                endTs: data.instance.endedAt ? new Date(data.instance.endedAt).getTime() : Date.now(),
                                startTs: new Date(data.instance.startedAt).getTime(),
                            }).humanize
                        }
                    </div>
                }
                trades={<div className="truncate">{data.instance._count.Trade}</div>}
                eoa={<div className="truncate">{shortenValue(eoa)}</div>}
                className="bg-milk-50 px-3 py-2 rounded-lg hover:bg-milk-100 transition-colors duration-200"
            />
        </LinkWrapper>
    )
})

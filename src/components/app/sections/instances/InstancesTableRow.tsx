'use client'

import { ReactNode } from 'react'
import { cn, DAYJS_FORMATS, getDurationBetween, shortenValue } from '@/utils'
import { memo } from 'react'
import { EnrichedInstance } from '@/types'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import { LiveDate } from '@/components/common/LiveDate'
import StyledTooltip from '@/components/common/StyledTooltip'
import { useAppStore } from '@/stores/app.store'
import { SupportedFilters, SupportedFilterDirections, IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { jsonConfigParser } from '@/utils/data/parser'

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
            <div className="grid grid-cols-12 gap-3 justify-center items-center col-span-3">
                <div className="w-full col-span-2 pl-2">{props.index}</div>
                <div className="w-full col-span-3">{props.instance}</div>
                <div className="w-full col-span-2">{props.chain}</div>
                <div className="w-full col-span-5">{props.pair}</div>
            </div>

            {/* B */}
            <div className="grid grid-cols-12 gap-3 justify-center items-center col-span-4">
                <div className="w-full col-span-3">{props.configurationId}</div>
                <div className="w-full col-span-3 capitalize">{props.broadcast}</div>
                <div className="w-full col-span-3 capitalize">{props.reference}</div>
                <div className="w-full col-span-3">{props.targetSpread}</div>
            </div>

            {/* C */}
            <div className="grid grid-cols-12 gap-3 justify-center items-center col-span-5">
                <div className="w-full col-span-3">{props.startedAt}</div>
                <div className="w-full col-span-3">{props.endedAt}</div>
                <div className="w-full col-span-2">{props.duration}</div>
                <div className="w-full col-span-2">{props.trades}</div>
                <div className="w-full col-span-2">{props.eoa}</div>
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
                <p className="truncate text-center">{children}</p>
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
            instance={<p className="truncate">Instance</p>}
            chain={<p className="truncate">Chain</p>}
            pair={<p className="truncate text-center">Pair</p>}
            configurationId={<p className="truncate">Configuration</p>}
            broadcast={<p className="truncate">Broadcast</p>}
            reference={<p className="truncate">Reference</p>}
            targetSpread={<p className="truncate">Target Spread</p>}
            startedAt={<SortableHeader sortKey={SupportedFilters.INSTANCE_STARTED}>Started At</SortableHeader>}
            endedAt={<SortableHeader sortKey={SupportedFilters.INSTANCE_ENDED}>Ended At</SortableHeader>}
            duration={<SortableHeader sortKey={SupportedFilters.RUNNING_TIME}>Duration</SortableHeader>}
            trades={<SortableHeader sortKey={SupportedFilters.TRADE_COUNT}>Trades</SortableHeader>}
            eoa={<p className="truncate">EOA</p>}
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
    const parsedConfig = jsonConfigParser(data.config?.id, data.config?.values)
    // const broadcast = parsedConfig.execution.broadcastUrl ? String(parsedConfig.execution.broadcastUrl) : 'unknown' // v1
    const reference = parsedConfig.execution.priceFeedConfig.source ? String(parsedConfig.execution.priceFeedConfig.type) : 'unknown'
    const targetSpread = parsedConfig.execution.minSpreadThresholdBps ? `${String(parsedConfig.execution.minSpreadThresholdBps)} bps` : 'unknown'
    const eoa = parsedConfig.inventory.walletPublicKey ? String(parsedConfig.inventory.walletPublicKey) : ''
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
                    </div>
                }
                pair={
                    <div className="flex gap-1 items-center">
                        <DoubleSymbol symbolLeft={data.baseSymbol} symbolRight={data.quoteSymbol} size={23} gap={1} />
                        <p className="truncate">
                            {data.baseSymbol ? data.baseSymbol : '?'}/{data.quoteSymbol ? data.quoteSymbol : '?'}
                        </p>
                    </div>
                }
                configurationId={
                    // <StyledTooltip content={<pre className="text-xs">{JSON.stringify(data.config, null, 2)}</pre>}>
                    <StyledTooltip content={data.config.id}>
                        <div className="truncate" title={data.config.id}>
                            {shortenValue(data.config.id)}
                        </div>
                    </StyledTooltip>
                }
                broadcast={null}
                reference={<p>{reference}</p>}
                targetSpread={<p>{targetSpread}</p>}
                startedAt={<LiveDate date={data.instance.startedAt}>{DAYJS_FORMATS.dateShort(data.instance.startedAt)}</LiveDate>}
                endedAt={
                    data.instance.endedAt ? (
                        <LiveDate date={data.instance.endedAt}>{DAYJS_FORMATS.dateShort(data.instance.endedAt)}</LiveDate>
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

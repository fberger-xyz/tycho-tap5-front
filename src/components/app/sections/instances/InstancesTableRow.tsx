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
        <div className={cn('grid w-full grid-cols-12 items-center gap-3 text-sm', props.className)}>
            {/* A */}
            <div className="col-span-3 grid grid-cols-12 items-center justify-center gap-3">
                <div className="col-span-2 w-full">{props.index}</div>
                <div className="col-span-3 w-full">{props.instance}</div>
                <div className="col-span-2 w-full">{props.chain}</div>
                <div className="col-span-5 w-full">{props.pair}</div>
            </div>

            {/* B */}
            <div className="col-span-4 grid grid-cols-12 items-center justify-center gap-3">
                <div className="col-span-3 w-full">{props.configurationId}</div>
                <div className="col-span-3 w-full capitalize">{props.broadcast}</div>
                <div className="col-span-3 w-full capitalize">{props.reference}</div>
                <div className="col-span-3 w-full">{props.targetSpread}</div>
            </div>

            {/* C */}
            <div className="col-span-5 grid grid-cols-12 items-center justify-center gap-3">
                <div className="col-span-3 w-full">{props.startedAt}</div>
                <div className="col-span-3 w-full">{props.endedAt}</div>
                <div className="col-span-2 w-full">{props.duration}</div>
                <div className="col-span-2 w-full">{props.trades}</div>
                <div className="col-span-2 w-full">{props.eoa}</div>
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
                className="hover:text-milk-300 flex min-w-fit items-center gap-1 transition-colors"
            >
                <p className="truncate text-center">{children}</p>
                <div className="relative flex h-8 w-5 flex-col">
                    <IconWrapper
                        id={IconIds.TRIANGLE_UP}
                        className={cn(
                            'absolute top-1 size-5 transition-opacity duration-200',
                            isActive && isAscending ? 'text-aquamarine opacity-100' : 'text-milk-400',
                        )}
                    />
                    <IconWrapper
                        id={IconIds.TRIANGLE_DOWN}
                        className={cn(
                            'absolute bottom-0.5 size-5 transition-opacity duration-200',
                            isActive && !isAscending ? 'text-aquamarine opacity-100' : 'text-milk-400',
                        )}
                    />
                </div>
            </button>
        )
    }

    return (
        <InstanceRowTemplate
            index={<p>#</p>}
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
            className="px-4 text-milk-200"
        />
    )
}

/**
 * ------------------------ 3 loading row
 */

export function LoadingInstanceRows() {
    const loadingParagraph = <p className="skeleton-loading h-6 w-3/4 rounded-lg">Loading...</p>
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
                        className="rounded-lg bg-milk-50 py-2 text-transparent"
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
                    <div className="flex items-center gap-1">
                        <ChainImage id={data.chainId} size={22} />
                    </div>
                }
                pair={
                    <div className="flex items-center gap-1">
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
                className="rounded-lg bg-milk-50 px-3 py-2 transition-colors duration-200 hover:bg-milk-100"
            />
        </LinkWrapper>
    )
})

'use client'

import { Instance } from '@prisma/client'
import { cn, DAYJS_FORMATS, shortenValue } from '@/utils'
import { LiveDate } from '@/components/common/LiveDate'
import StyledTooltip from '@/components/common/StyledTooltip'

export function InstanceEntryTemplate(props: {
    started: React.ReactNode
    ended: React.ReactNode
    instance: React.ReactNode
    targetSpread: React.ReactNode
    status: React.ReactNode
    info: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('grid grid-cols-6 gap-2 text-xs pl-1', props.className)}>
            <div className="col-span-1">{props.started}</div>
            <div className="col-span-1">{props.ended}</div>
            <div className="col-span-1">{props.instance}</div>
            <div className="col-span-1">{props.targetSpread}</div>
            <div className="col-span-1">{props.status}</div>
            <div className="col-span-1">{props.info}</div>
        </div>
    )
}

export function InstanceEntryHeader() {
    return (
        <InstanceEntryTemplate
            started={<p>Started</p>}
            ended={<p>Ended</p>}
            instance={<p>Id</p>}
            targetSpread={<p>Spread</p>}
            status={<p>Status</p>}
            info={<p>Info</p>}
            className="text-milk-200"
        />
    )
}

export function InstanceEntry({ instance, index }: { instance: Instance & { Configuration?: { chainId: number } }; index: number }) {
    // const castedConfig = instance.config as unknown as UnstableInstanceConfigValues

    return (
        <InstanceEntryTemplate
            key={instance.id}
            instance={
                <StyledTooltip content={<pre className="text-xs">{instance.id}</pre>}>
                    <p>{shortenValue(instance.id)}</p>
                </StyledTooltip>
            }
            started={
                <div className="flex items-center gap-1">
                    <p className="text-milk-200 w-4">{index + 1}.</p>
                    <LiveDate date={instance.startedAt}>{DAYJS_FORMATS.timeAgo(instance.startedAt)}</LiveDate>
                </div>
            }
            ended={
                <div className="flex items-center gap-1">
                    {instance.endedAt ? <LiveDate date={instance.endedAt}>{DAYJS_FORMATS.timeAgo(instance.endedAt)}</LiveDate> : <p>-</p>}
                </div>
            }
            targetSpread={
                null
                // castedConfig?.target_spread_bps ? (
                //     <RoundedAmount amount={castedConfig.target_spread_bps}>
                //         <p>{numeral(castedConfig.target_spread_bps).format('0,0')} bps</p>
                //     </RoundedAmount>
                // ) : (
                //     <p>-</p>
                // )
            }
            status={
                instance.endedAt ? (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <p>Stopped</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p>Running</p>
                    </div>
                )
            }
            info={
                <StyledTooltip key={instance.id} content={<pre className="text-xs">{JSON.stringify(instance.config, null, 2)}</pre>}>
                    <p>Data</p>
                </StyledTooltip>
            }
            className="text-milk-400 hover:text-milk group"
        />
    )
}

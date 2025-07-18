'use client'

import { cn } from '@/utils'
import { ReactNode, memo } from 'react'
import { InstanceRowLayout } from './InstancesTableRowLayout'
import { AppInstanceStatus } from '@/enums'
import InstanceStatus from '../InstanceStatus'

export const Cell = memo(function Cell({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn('h-full flex items-center justify-center py-2 px-1 truncate', className)}>{children}</div>
})

export const GroupedInstanceRow = memo(function GroupedInstanceRow(props: {
    instance: {
        id: string
        createdAt: string
        startedAt: string
        runningTime: string
        status: AppInstanceStatus
        endedAt?: string
        tradeCount: number
        pricesCountCalled: number
    }
    className?: string
}) {
    return (
        <div className={cn('pl-4 w-full transition-all duration-200 ease-in-out flex items-center', props.className)}>
            <InstanceRowLayout>
                <Cell className="col-span-4 justify-start">{props.instance.id}</Cell>
                <Cell className="col-span-1">{props.instance.startedAt}</Cell>
                <Cell className="col-span-3">{props.instance.runningTime}</Cell>
                <Cell className="col-span-1">
                    <InstanceStatus status={props.instance.status} />
                </Cell>
                <Cell className="col-span-1">{props.instance.endedAt || '-'}</Cell>
                <Cell className="col-span-1">{props.instance.tradeCount}</Cell>
            </InstanceRowLayout>
        </div>
    )
})

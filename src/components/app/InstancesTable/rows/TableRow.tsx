'use client'

import { cn, shortenValue } from '@/utils'
import { ReactNode, memo } from 'react'
import { InstanceRowLayout, ConfigSection, InstanceDetailsSection, ChainAndPairSection } from '../shared/InstanceRowLayout'
import { AppInstanceStatus } from '@/enums'
import { ChainImage, SymbolImage } from '@/components/common/ImageWrapper'

export const Cell = memo(function Cell({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn('h-full flex items-center justify-center py-2 px-1 truncate', className)}>{children}</div>
})

export const InstanceRow = memo(function InstanceRow(props: {
    chain: string
    base: string
    quote: string
    configuration: {
        id: string
        createdAt: string
    }
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
    // Status color mapping
    const statusColors = {
        running: 'text-green-600 bg-green-50',
        stopped: 'text-gray-600 bg-gray-50',
        paused: 'text-yellow-600 bg-yellow-50',
        error: 'text-red-600 bg-red-50',
    } as const

    return (
        <div className={cn('w-full border-b border-milk-200 transition-all duration-200 ease-in-out h-14 flex items-center', props.className)}>
            <InstanceRowLayout>
                {/* Pair section */}
                <ChainAndPairSection>
                    <Cell>
                        <ChainImage id={Number(props.chain)} className="size-6 rounded-full" />
                    </Cell>
                    <Cell>
                        <SymbolImage symbol={props.base} className="size-6 rounded-full" />
                        <SymbolImage symbol={props.quote} className="-mr-3 size-6 rounded-full" />
                    </Cell>
                </ChainAndPairSection>

                {/* Config section */}
                <ConfigSection>
                    <Cell className="">{props.configuration.id}</Cell>
                    <Cell className="">{props.configuration.createdAt}</Cell>
                </ConfigSection>

                {/* Instance Details section */}
                <InstanceDetailsSection>
                    <Cell className="col-span-1">{shortenValue(props.instance.id.split('-').pop() || '', 4)}</Cell>
                    <Cell className="col-span-1">{props.instance.createdAt}</Cell>
                    <Cell className="col-span-1">{props.instance.startedAt}</Cell>
                    <Cell className="col-span-1">{props.instance.runningTime}</Cell>
                    <Cell className="col-span-1">
                        <span className={cn('px-2 py-1 rounded-full', statusColors[props.instance.status as keyof typeof statusColors])}>
                            {props.instance.status}
                        </span>
                    </Cell>
                    <Cell className="col-span-1">{props.instance.endedAt || '-'}</Cell>
                    <Cell className="col-span-1">{props.instance.tradeCount}</Cell>
                    {/* <Cell className="col-span-1">{props.instance.pricesCountCalled}</Cell> */}
                </InstanceDetailsSection>
            </InstanceRowLayout>
        </div>
    )
})

// Legacy export for backward compatibility
export const TokensInstanceRow = InstanceRow

// Legacy component for backward compatibility
export function SupplyBorrowCell({
    data,
}: {
    data: {
        usd?: ReactNode
        usage?: ReactNode
        yield?: ReactNode
    }
}) {
    return (
        <div className="col-span-4 grid h-full grid-cols-2">
            <div className="col-span-1 flex items-center justify-center">{data.usd}</div>
            <Cell className="bg-inactive/5">{data.yield}</Cell>
        </div>
    )
}

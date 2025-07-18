'use client'

import { cn, shortenValue } from '@/utils'
import { ReactNode, memo } from 'react'
import { InstanceRowLayout, ConfigSection, InstanceDetailsSection, ChainAndPairSection } from './InstancesTableRowLayout'
import { AppInstanceStatus } from '@/enums'
import { ChainImage, SymbolImage } from '@/components/common/ImageWrapper'
import InstanceStatus from '../InstanceStatus'

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
    return (
        <div className={cn('w-full transition-all duration-200 ease-in-out h-14 flex items-center', props.className)}>
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
                        <InstanceStatus status={props.instance.status} />
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

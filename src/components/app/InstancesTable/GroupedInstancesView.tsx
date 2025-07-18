'use client'

import { memo, useState } from 'react'
import { cn } from '@/utils'
import dayjs from 'dayjs'
import { getDurationBetween } from '@/utils'
import { AppInstanceStatus, IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import { ImageWithText } from '@/components/common/ImageWrapper'
import { GroupedTableHeaders } from './GroupedTableHeaders'
import { GroupedInstanceRow } from './GroupedInstanceRow'

interface InstanceData {
    chain: string
    chainName?: string
    base: string
    quote: string
    configuration: {
        id: string
        createdAt: Date | string
    }
    instance: {
        id: string
        createdAt: Date | string
        startedAt: Date | string
        endedAt?: Date | string | null
        tradeCount: number
        pricesCountCalled: number
        status?: AppInstanceStatus
    }
}

interface GroupedData {
    chain: string
    chainName?: string
    pairs: {
        pair: string
        base: string
        quote: string
        configs: {
            configId: string
            configCreatedAt: Date | string
            instances: InstanceData[]
        }[]
    }[]
}

const CollapsibleHeader = memo(function CollapsibleHeader({
    isOpen,
    onToggle,
    children,
    count,
}: {
    isOpen: boolean
    onToggle: () => void
    children: React.ReactNode
    count: number
}) {
    return (
        <button
            onClick={onToggle}
            className={cn('flex w-full items-center gap-2 py-2 px-4 hover:bg-milk-100 transition-colors text-left', 'border-b border-milk-200')}
        >
            <IconWrapper id={isOpen ? IconIds.CHEVRON_DOWN : IconIds.CHEVRON_RIGHT} className="size-4 text-milk/60" />
            <span className="flex-1">{children}</span>
            <span className="text-milk">({count})</span>
        </button>
    )
})

const ConfigGroup = memo(function ConfigGroup({
    config,
    configurationIndex,
}: {
    config: GroupedData['pairs'][0]['configs'][0]
    configurationIndex: number
}) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div>
            <CollapsibleHeader isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} count={config.instances.length}>
                {configurationIndex + 1}. Configuration: {config.configId}
            </CollapsibleHeader>

            {isOpen && (
                <>
                    <GroupedTableHeaders />
                    {config.instances.map((instance, idx) => {
                        const startTime = new Date(instance.instance.startedAt).getTime()
                        const endTime = instance.instance.endedAt ? new Date(instance.instance.endedAt).getTime() : Date.now()
                        const runningTime = getDurationBetween({ startTs: startTime, endTs: endTime }).oneLiner

                        return (
                            <div key={`${instance.instance.id}-${idx}`} className="border-b border-milk-200">
                                <GroupedInstanceRow
                                    instance={{
                                        id: instance.instance.id,
                                        createdAt: dayjs(instance.instance.createdAt).format('MMM D, HH:mm'),
                                        startedAt: dayjs(instance.instance.startedAt).format('MMM D, HH:mm'),
                                        runningTime,
                                        status:
                                            instance.instance.status ||
                                            (instance.instance.endedAt ? AppInstanceStatus.STOPPED : AppInstanceStatus.RUNNING),
                                        endedAt: instance.instance.endedAt ? dayjs(instance.instance.endedAt).format('MMM D, HH:mm') : undefined,
                                        tradeCount: instance.instance.tradeCount,
                                        pricesCountCalled: instance.instance.pricesCountCalled,
                                    }}
                                />
                            </div>
                        )
                    })}
                </>
            )}
        </div>
    )
})

const PairGroup = memo(function PairGroup({ pair }: { pair: GroupedData['pairs'][0] }) {
    const [isOpen, setIsOpen] = useState(true)
    const totalInstances = pair.configs.reduce((sum, config) => sum + config.instances.length, 0)

    return (
        <div className="ml-4">
            <CollapsibleHeader isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} count={totalInstances}>
                {/* {pair.base}/{pair.quote} */}
                <div className="flex gap-1">
                    <ImageWithText symbol={pair.base} className="size-6" />
                    <ImageWithText symbol={pair.quote} className="size-6" />
                </div>
            </CollapsibleHeader>

            {isOpen && (
                <div className="border-l border-milk-200 ml-4">
                    {pair.configs.map((config, configurationIndex) => (
                        <ConfigGroup key={`${config.configId}-${configurationIndex}`} configurationIndex={configurationIndex} config={config} />
                    ))}
                </div>
            )}
        </div>
    )
})

const ChainGroup = memo(function ChainGroup({ group }: { group: GroupedData }) {
    const [isOpen, setIsOpen] = useState(true)
    const totalInstances = group.pairs.reduce((sum, pair) => sum + pair.configs.reduce((pairSum, config) => pairSum + config.instances.length, 0), 0)

    return (
        <div>
            <CollapsibleHeader isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} count={totalInstances}>
                <ImageWithText chainId={Number(group.chain)} className="size-6" />
            </CollapsibleHeader>

            {isOpen && (
                // className="border-b border-milk-200"
                <div>
                    {group.pairs.map((pair, pairIndex) => (
                        <PairGroup key={`${pair.pair}-${pairIndex}`} pair={pair} />
                    ))}
                </div>
            )}
        </div>
    )
})

export const GroupedInstancesView = memo(function GroupedInstancesView({ data }: { data: InstanceData[] }) {
    // Group data by chain > pair > config
    const groupedData: GroupedData[] = []

    data.forEach((instance) => {
        // Find or create chain group
        let chainGroup = groupedData.find((g) => g.chain === instance.chain)
        if (!chainGroup) {
            chainGroup = {
                chain: instance.chain,
                chainName: instance.chainName,
                pairs: [],
            }
            groupedData.push(chainGroup)
        }

        // Find or create pair group
        const pairKey = `${instance.base}/${instance.quote}`
        let pairGroup = chainGroup.pairs.find((p) => p.pair === pairKey)
        if (!pairGroup) {
            pairGroup = {
                pair: pairKey,
                base: instance.base,
                quote: instance.quote,
                configs: [],
            }
            chainGroup.pairs.push(pairGroup)
        }

        // Find or create config group
        let configGroup = pairGroup.configs.find((c) => c.configId === instance.configuration.id)
        if (!configGroup) {
            configGroup = {
                configId: instance.configuration.id,
                configCreatedAt: instance.configuration.createdAt,
                instances: [],
            }
            pairGroup.configs.push(configGroup)
        }

        // Add instance to config group
        configGroup.instances.push(instance)
    })

    return (
        <div className="max-h-[70vh] overflow-y-auto">
            {groupedData.map((group, idx) => (
                <ChainGroup key={`${group.chain}-${idx}`} group={group} />
            ))}
        </div>
    )
})

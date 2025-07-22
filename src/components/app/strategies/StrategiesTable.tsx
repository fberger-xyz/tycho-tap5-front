'use client'

import { StrategyRow, LoadingStrategyRows } from './StrategiesTableRow'
import { EnrichedInstance } from '@/types'

export function StrategiesTable({ data, isLoading }: { data?: EnrichedInstance[]; isLoading?: boolean }) {
    return (
        <div className="flex w-full flex-col overflow-hidden gap-5">
            {isLoading ? (
                <LoadingStrategyRows />
            ) : !data || data.length === 0 ? (
                <div className="bg-milk-50 px-3 rounded-lg text-transparent flex items-center justify-center py-8">
                    <p className="m-auto text-folly">No instances</p>
                </div>
            ) : (
                data.map((instance) => <StrategyRow key={instance.instance.id} data={instance} />)
            )}
        </div>
    )
}

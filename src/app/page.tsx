'use client'

import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import { ListToShow } from '@/enums'
import { cn } from '@/utils'
import { useAppStore } from '@/stores/app.store'
import Card from '@/components/figma/Card'
import StrategiesList from '@/components/app/strategies/list/StrategiesList'
import UsdAmount from '@/components/figma/UsdAmount'
import { TradesList } from '@/components/app/trades/TradesList'

export default function Page() {
    const { listToShow, setListToShow } = useAppStore()
    return (
        <HydratedPageWrapper>
            {/* KPIs */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-14 w-full">
                <Card>
                    <p className="text-sm text-milk-400">Total PnL</p>
                    <UsdAmount amountUsd={8234.56} variationPercentage={0.0702} />
                </Card>
                <Card>
                    <p className="text-sm text-milk-400">Total AUM</p>
                    <UsdAmount amountUsd={95807.48} variationPercentage={-0.102} />
                </Card>
                <Card>
                    <p className="text-sm text-milk-400">Total trades</p>
                    <p className="text-lg font-semibold">237</p>
                </Card>
            </div>

            {/* list to show */}
            <div className="flex gap-6 mb-8">
                {Object.values(ListToShow).map((list) => (
                    <button key={list} className={cn('cursor-pointer')} onClick={() => setListToShow(list)}>
                        <p className={cn('text-lg', { 'text-milk': list === listToShow, 'text-milk-400': list !== listToShow })}>{list}</p>
                    </button>
                ))}
            </div>

            {listToShow === ListToShow.STRATEGIES && <StrategiesList />}
            {listToShow === ListToShow.TRADES && <TradesList />}
        </HydratedPageWrapper>
    )
}

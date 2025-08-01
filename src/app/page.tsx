'use client'

import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import { ListToShow } from '@/enums'
import { cn } from '@/utils'
import Card from '@/components/figma/Card'
import StrategiesList from '@/components/app/strategies/list/StrategiesList'
import UsdAmount from '@/components/figma/UsdAmount'
import { TradesList } from '@/components/app/trades/TradesList'
import { useAggregatedAUM } from '@/hooks/useAggregatedAUM'
import { useStrategies } from '@/hooks/fetchs/useStrategies'
import Skeleton from '@/components/common/Skeleton'
import { useTabFromUrl } from '@/hooks/useTabFromUrl'

export default function Page() {
    const { tab, setTab } = useTabFromUrl()
    const { totalAUM, isLoading: totalAUMIsLoading, error: aumError } = useAggregatedAUM()
    const { strategies } = useStrategies()
    return (
        <HydratedPageWrapper>
            {/* KPIs */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-14 w-full">
                <Card>
                    <p className="text-sm text-milk-400">Total PnL</p>
                    <Skeleton variant="text" />
                </Card>
                <Card>
                    <p className="text-sm text-milk-400">Total AUM</p>
                    {totalAUMIsLoading ? (
                        <Skeleton variant="text" />
                    ) : aumError ? (
                        <p className="text-sm text-folly">Failed to load</p>
                    ) : (
                        <UsdAmount amountUsd={totalAUM} variationPercentage={0} />
                    )}
                </Card>
                <Card>
                    <p className="text-sm text-milk-400">Total trades</p>
                    {strategies.length ? (
                        <p className="text-lg font-semibold">
                            {strategies.reduce(
                                (acc, strategy) => acc + strategy.instances.reduce((acc, instance) => acc + instance.value.trades.length, 0),
                                0,
                            )}
                        </p>
                    ) : (
                        <Skeleton variant="text" />
                    )}
                </Card>
            </div>

            {/* list to show */}
            <div className="flex gap-6 mb-8">
                {Object.values(ListToShow).map((list) => (
                    <button key={list} className={cn('cursor-pointer')} onClick={() => setTab(list)}>
                        <p className={cn('text-lg', { 'text-milk': list === tab, 'text-milk-400': list !== tab })}>{list}</p>
                    </button>
                ))}
            </div>

            {tab === ListToShow.STRATEGIES && <StrategiesList />}
            {tab === ListToShow.TRADES && <TradesList />}
        </HydratedPageWrapper>
    )
}

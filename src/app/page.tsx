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
import { DEFAULT_PADDING_X } from '@/config'
import numeral from 'numeral'

export default function Page() {
    const { tab, setTab } = useTabFromUrl()
    const { totalAUM, isLoading: totalAUMIsLoading, error: aumError } = useAggregatedAUM()
    const { strategies } = useStrategies()
    return (
        <HydratedPageWrapper paddingX="px-0">
            {/* KPIs */}
            <div className="mb-14 grid w-full grid-cols-1 gap-4 px-6 sm:grid-cols-3 md:px-8 lg:px-10">
                <Card>
                    <p className="text-xs text-milk-600">Total PnL</p>
                    <p className="truncate text-lg text-milk-200">To be computed</p>
                </Card>
                <Card>
                    <p className="text-xs text-milk-600">Total AUM</p>
                    {totalAUMIsLoading ? (
                        <Skeleton variant="text" />
                    ) : aumError ? (
                        <p className="truncate text-lg text-milk-200">Failed to load</p>
                    ) : (
                        <UsdAmount amountUsd={totalAUM} variationPercentage={0} textClassName="text-lg" />
                    )}
                </Card>
                <Card>
                    <p className="text-xs text-milk-600">Total Trades</p>
                    {strategies.length ? (
                        <p className="text-lg font-semibold text-milk">
                            {numeral(
                                strategies.reduce(
                                    (acc, strategy) => acc + strategy.instances.reduce((acc, instance) => acc + instance.value.trades.length, 0),
                                    0,
                                ),
                            ).format('0,0')}
                        </p>
                    ) : (
                        <Skeleton variant="text" />
                    )}
                </Card>
            </div>

            {/* list to show */}
            <div className={cn('mb-8 flex gap-6', DEFAULT_PADDING_X)}>
                {Object.values(ListToShow).map((list) => (
                    <button key={list} className="cursor-pointer" onClick={() => setTab(list)}>
                        <p className={cn('font-inter-tight text-lg', { 'text-milk': list === tab, 'text-milk-400': list !== tab })}>{list}</p>
                    </button>
                ))}
            </div>

            {tab === ListToShow.STRATEGIES && <StrategiesList />}
            {tab === ListToShow.TRADES && <TradesList />}
        </HydratedPageWrapper>
    )
}

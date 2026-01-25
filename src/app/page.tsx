'use client'

import { useMemo } from 'react'
import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import Card from '@/components/figma/Card'
import StrategiesList from '@/components/app/strategies/list/StrategiesList'
import UsdAmount from '@/components/figma/UsdAmount'
import { useAggregatedAUM } from '@/hooks/useAggregatedAUM'
import { useStrategiesWithStore } from '@/hooks/stores/useStrategiesWithStore'
import { countTotalTrades } from '@/utils/trade-count.util'
import Skeleton from '@/components/common/Skeleton'
import numeral from 'numeral'

export default function Page() {
    const { totalAUM, isLoading: totalAUMIsLoading, error: aumError } = useAggregatedAUM()
    const { strategies } = useStrategiesWithStore()
    const totalTrades = useMemo(() => countTotalTrades(strategies), [strategies])
    return (
        <HydratedPageWrapper paddingX="px-0">
            {/* KPIs */}
            <div className="mb-14 grid w-full grid-cols-1 gap-4 px-6 sm:grid-cols-2 md:px-8 lg:px-10">
                {/* <Card>
                    <p className="text-xs text-milk-600">Total PnL</p>
                    <p className="truncate text-lg text-milk-200">To be computed</p>
                </Card> */}
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
                        <p className="text-lg font-semibold text-milk">{numeral(totalTrades).format('0,0')}</p>
                    ) : (
                        <Skeleton variant="text" />
                    )}
                </Card>
            </div>

            <StrategiesList />
        </HydratedPageWrapper>
    )
}

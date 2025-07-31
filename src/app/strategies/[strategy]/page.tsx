'use client'

import PageWrapper from '@/components/common/PageWrapper'
// import StrategyBreakdownPerChain from '@/components/app/strategies/strategy/StrategyBreakdownPerChain'
import { useParams } from 'next/navigation'

export default function StrategyPage() {
    const { strategy: strategyId } = useParams()
    console.log({ strategyId })
    return (
        <PageWrapper>
            <p>Strategy {strategyId}</p>
            {/* <StrategyBreakdownPerChain /> */}
        </PageWrapper>
    )
}

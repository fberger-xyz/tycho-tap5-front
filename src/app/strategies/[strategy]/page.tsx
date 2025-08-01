'use client'

import PageWrapper from '@/components/common/PageWrapper'
// import StrategyBreakdownPerChain from '@/components/app/strategies/strategy/StrategyBreakdownPerChain'
import { useParams } from 'next/navigation'

export default function StrategyPage() {
    const { strategy: strategyId } = useParams()
    console.log({ strategyId })

    // todo get all instances of this configuration (normaly on 1 chain)
    // todo get all trades of this configuration

    return (
        <PageWrapper>
            <p>Configuration {strategyId}</p>
            {/* <StrategyBreakdownPerChain /> */}
        </PageWrapper>
    )
}

'use client'

import { Strategy } from '@/types'

export default function StrategyChart(props: { strategy: Strategy; className?: string }) {
    return <p>{props.strategy.pair}</p>
}

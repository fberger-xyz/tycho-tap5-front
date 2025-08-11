'use client'

import { ReactNode } from 'react'

export default function StrategyTemplate(props: {
    header: ReactNode
    banner?: ReactNode
    kpis: ReactNode
    chart: ReactNode
    pools: ReactNode
    trades: ReactNode
    inventory: ReactNode
    configurations: ReactNode
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">{props.header}</div>
            {props.banner && <div className="w-full text-xs">{props.banner}</div>}
            <div className="grid grid-cols-12 gap-6">
                {/* left */}
                <div className="md:col-span-8 col-span-12 flex flex-col gap-4">
                    {props.kpis}
                    {props.chart}
                    {props.pools}
                    {props.trades}
                </div>
                {/* right */}
                <div className="md:col-span-4 col-span-12 flex flex-col gap-4">
                    {props.inventory}
                    {props.configurations}
                </div>
            </div>
        </div>
    )
}

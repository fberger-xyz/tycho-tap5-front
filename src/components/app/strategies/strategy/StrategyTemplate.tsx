'use client'

import { ReactNode } from 'react'

export default function StrategyTemplate(props: {
    header: ReactNode
    kpis: ReactNode
    chart: ReactNode
    trades: ReactNode
    inventory: ReactNode
    configurations: ReactNode
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">{props.header}</div>
            <div className="grid grid-cols-12 gap-6">
                {/* left */}
                <div className="md:col-span-8 col-span-12 flex flex-col gap-4">
                    {props.kpis}
                    {props.chart}
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

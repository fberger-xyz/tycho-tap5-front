'use client'

import Card from '@/components/figma/Card'
import { ErrorBoundary } from 'react-error-boundary'
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
                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading KPIs</div>
                            </Card>
                        }
                    >
                        {props.kpis}
                    </ErrorBoundary>

                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading chart</div>
                            </Card>
                        }
                    >
                        {props.chart}
                    </ErrorBoundary>

                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading pools</div>
                            </Card>
                        }
                    >
                        {props.pools}
                    </ErrorBoundary>
                    {props.trades}
                </div>

                {/* right */}
                <div className="md:col-span-4 col-span-12 flex flex-col gap-4">
                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading inventory</div>
                            </Card>
                        }
                    >
                        {props.inventory}
                    </ErrorBoundary>
                    <ErrorBoundary
                        fallback={
                            <Card className="gap-5 px-0 pb-0">
                                <div className="p-5 text-red-500">Error loading configurations</div>
                            </Card>
                        }
                    >
                        {props.configurations}
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    )
}

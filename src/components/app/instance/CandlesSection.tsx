'use client'

import { Suspense } from 'react'
// import OneInchCandlestickChart from '@/components/charts/OneInchCandlestickChart'
import { SectionLayout } from '@/components/app/sections/SectionLayout'
import { useAppStore } from '@/stores/app.store'
import { IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import { SymbolImage } from '@/components/common/ImageWrapper'
import { EnrichedInstance } from '@/types'

const DESCRIPTION = 'Latest prices - WIP 🚧'

export default function CandlesSection({ instance }: { instance: EnrichedInstance }) {
    const { showCandlesSection, setShowCandlesSection } = useAppStore()

    return (
        <SectionLayout
            title={
                <div className="w-full flex justify-between">
                    <button
                        onClick={() => setShowCandlesSection(!showCandlesSection)}
                        className="flex gap-1 items-center rounded-lg px-2.5 py-1.5 hover:bg-milk-100 transition-colors duration-300 -ml-1 w-fit"
                        aria-expanded={showCandlesSection}
                        aria-label={`${showCandlesSection ? 'Collapse' : 'Expand'} candles section`}
                    >
                        <div className="flex items-center gap-2">
                            <SymbolImage symbol={instance.baseSymbol} size={22} />
                            <SymbolImage symbol={instance.quoteSymbol} size={22} className="-ml-3 rounded-full" />
                            <p>
                                {instance.baseSymbol}/{instance.quoteSymbol ? instance.quoteSymbol : '?'}
                            </p>
                        </div>
                        <IconWrapper id={showCandlesSection ? IconIds.TRIANGLE_UP : IconIds.TRIANGLE_DOWN} className="size-5" />
                    </button>
                </div>
            }
            content={
                showCandlesSection ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-milk-400">{DESCRIPTION}</p>
                        <div className="h-[250px]">
                            <Suspense fallback={<div className="flex items-center justify-center h-full text-milk">Loading chart...</div>}>
                                {/* <OneInchCandlestickChart configuration={instance.config} /> */}
                            </Suspense>
                        </div>
                    </div>
                ) : null
            }
        />
    )
}

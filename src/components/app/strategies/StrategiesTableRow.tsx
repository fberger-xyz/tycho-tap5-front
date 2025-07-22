'use client'

import { ReactNode } from 'react'
import { cn } from '@/utils'
import { memo } from 'react'
import { EnrichedInstance } from '@/types'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'

/**
 * ------------------------ 1 template
 */

export const StrategyRowTemplate = (props: {
    pairImages: ReactNode
    pairSymbols: ReactNode
    spread: ReactNode
    chains: ReactNode
    kpis: ReactNode
    className?: string
}) => {
    return (
        <div className={cn('w-full flex flex-col group', props.className)}>
            {/* row 1 */}
            <div className="flex flex-row gap-4 center p-4 bg-milk-50 items-center group-hover:bg-milk-100 rounded-t-2xl transition-colors duration-200">
                {props.pairImages}
                <div className="flex flex-col gap-2">
                    {/* sub row 1 */}
                    <div className="flex gap-2 items-center">
                        {props.pairSymbols}
                        {props.spread}
                    </div>

                    {/* sub row 2 */}
                    <div className="flex gap-2 items-center">{props.chains}</div>
                </div>
            </div>

            {/* row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-between items-center bg-milk-100 group-hover:bg-milk-200 p-5 rounded-b-2xl transition-colors duration-200">
                {props.kpis}
            </div>
        </div>
    )
}

/**
 * ------------------------ 2 header
 */

// none

/**
 * ------------------------ 3 loading row
 */

export function LoadingStrategyRows() {
    const loadingParagraph = <p className="w-3/4 skeleton-loading h-6 rounded-lg">Loading...</p>
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {Array.from({ length: 8 }, (_, i) => (
                    <StrategyRowTemplate
                        key={i}
                        pairImages={<DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={48} gap={2} />}
                        pairSymbols={loadingParagraph}
                        spread={loadingParagraph}
                        chains={loadingParagraph}
                        kpis={loadingParagraph}
                        className="text-transparent"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * ------------------------ 4 content row
 */

export const StrategyRow = memo(function StrategyRow({ data }: { data: EnrichedInstance }) {
    const targetSpread = data.config?.values.target_spread_bps ? `${String(data.config?.values.target_spread_bps)} bps` : 'unknown'
    return (
        <LinkWrapper href={`/instances/${data.instance.id}`} className="w-full">
            <StrategyRowTemplate
                pairImages={<DoubleSymbol symbolLeft={data.baseSymbol} symbolRight={data.quoteSymbol} size={48} gap={2} />}
                pairSymbols={
                    <p className="truncate font-semibold text-base">
                        {data.baseSymbol ? data.baseSymbol : '?'} / {data.quoteSymbol ? data.quoteSymbol : '?'}
                    </p>
                }
                spread={
                    <div className="flex gap-1 items-center bg-milk-100 rounded px-1.5 py-1 text-xs">
                        <p className="truncate">{targetSpread}</p>
                    </div>
                }
                chains={
                    <div className="flex gap-2 items-center">
                        <ChainImage id={data.chainId} size={18} />
                        <p className="truncate text-milk-400 text-sm">{CHAINS_CONFIG[data.chainId]?.name ?? 'unknown'}</p>
                    </div>
                }
                kpis={
                    <>
                        <div className="flex flex-col gap-1 items-start">
                            <p className="truncate text-milk-400 text-sm">Instances</p>
                            <p className="truncate">Todo</p>
                        </div>
                        {Array.from({ length: 3 }, (_, i) => (
                            <div key={i} className="flex flex-col gap-1 items-start">
                                <p className="truncate text-milk-400 text-sm">Metric {i + 1}</p>
                                <p className="truncate">Todo</p>
                            </div>
                        ))}
                    </>
                }
                className="transition-colors duration-200"
            />
        </LinkWrapper>
    )
})

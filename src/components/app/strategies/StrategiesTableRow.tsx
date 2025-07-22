'use client'

import { ReactNode } from 'react'
import { cn, shortenValue } from '@/utils'
import { memo } from 'react'
import { Strategy } from '@/types'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import numeral from 'numeral'

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
    const loadingClass = 'w-3/4 skeleton-loading h-6 rounded-lg'
    const loadingParagraph = <p className={loadingClass}>Loading...</p>
    return (
        <>
            {Array.from({ length: 3 }, (_, i) => (
                <StrategyRowTemplate
                    key={i}
                    pairImages={<DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={48} gap={2} />}
                    pairSymbols={loadingParagraph}
                    spread={loadingParagraph}
                    chains={loadingParagraph}
                    kpis={
                        <>
                            {Array.from({ length: 4 }, (_, i) => (
                                <div key={i} className="flex flex-col gap-1 items-start">
                                    <p className={loadingClass}>Metric {i + 1}</p>
                                    <p className={loadingClass}>Todo</p>
                                </div>
                            ))}
                        </>
                    }
                    className="text-transparent"
                />
            ))}
        </>
    )
}

/**
 * ------------------------ 4 content row
 */

export const StrategyRow = memo(function StrategyRow({ data, index }: { data: Strategy; index: number }) {
    return (
        <LinkWrapper key={`${data.pair}-${index}`} href={`/instances/${index}`} className="w-full">
            <StrategyRowTemplate
                pairImages={<DoubleSymbol symbolLeft={data.base.symbol} symbolRight={data.quote.symbol} size={48} gap={2} />}
                pairSymbols={
                    <p className="truncate font-semibold text-base">
                        {data.base.symbol} / {data.quote.symbol}
                    </p>
                }
                spread={
                    <div className="flex gap-1">
                        <div className="flex gap-1 items-center bg-milk-100 rounded px-1.5 py-1 text-xs">
                            <p className="truncate">target spread: {numeral(data.config.execution.targetSpreadBps).format('0.[0000]')} bps</p>
                        </div>
                        <div className="flex gap-1 items-center bg-milk-100 rounded px-1.5 py-1 text-xs">
                            <p className="truncate">
                                max. slippage: {numeral(data.config.execution.maxSlippagePct).multiply(10000).format('0.[0000]')} bps
                            </p>
                        </div>
                        <div className="flex gap-1 items-center bg-milk-100 rounded px-1.5 py-1 text-xs">
                            <p className="truncate">min. exec spread: {numeral(data.config.execution.minExecSpreadBps).format('0.[0000]')} bps</p>
                        </div>
                    </div>
                }
                chains={
                    <div className="flex gap-2 items-center">
                        <ChainImage id={data.config.chain.id} size={18} />
                        <p className="truncate text-milk-400 text-sm">{CHAINS_CONFIG[data.config.chain.id]?.name ?? 'unknown'}</p>
                    </div>
                }
                kpis={
                    <>
                        <div className="flex flex-col gap-1 items-start">
                            <p className="truncate text-milk-400 text-sm">Instances</p>
                            <p className="truncate">{data.instancesCount}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-start">
                            <p className="truncate text-milk-400 text-sm">Trades</p>
                            <p className="truncate">{data.tradesCount}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-start">
                            <p className="truncate text-milk-400 text-sm">P&L</p>
                            <p className="truncate">${numeral(data.pnl).format('0.[00]')}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-start">
                            <p className="truncate text-milk-400 text-sm">Inventory</p>
                            <p className="truncate">{shortenValue(data.config.inventory.walletPublicKey)}</p>
                        </div>
                    </>
                }
                className="transition-colors duration-200"
            />
        </LinkWrapper>
    )
})

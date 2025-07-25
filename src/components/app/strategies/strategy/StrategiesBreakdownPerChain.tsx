'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useStrategies } from '@/hooks/fetchs/all/useStrategies'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import { cn, listTradesByChain } from '@/utils'
import { StrategyChain } from './StrategyChain'
import { IconIds } from '@/enums/icons.enum'
import IconWrapper from '@/components/icons/IconWrapper'

export default function StrategiesBreakdownPerChain() {
    const params = useParams()
    const strategyId = params.strategy as string
    const { isLoading, error, hasError, strategies } = useStrategies()
    const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({})

    // Find the strategy by pair
    const strategy = strategies.find((s) => s.pair.toLowerCase() === strategyId.toLowerCase())

    if (isLoading && !strategy) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-milk">Loading strategy...</div>
            </div>
        )
    }

    if (hasError && error) {
        return (
            <div className="w-full border border-red-200 bg-red-50 p-4 rounded-xl">
                <p className="text-red-600 text-sm font-medium">Failed to load strategy</p>
            </div>
        )
    }

    if (!strategy) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-milk">Strategy not found</div>
            </div>
        )
    }

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* top lg:left */}
            <div className="col-span-1 lg:col-span-12 flex flex-col h-fit">
                {/* pair */}
                <div className="flex flex-row gap-3 center items-center mb-4">
                    <DoubleSymbol symbolLeft={strategy.base.symbol} symbolRight={strategy.quote.symbol} size={56} gap={2} />
                    <div className="flex flex-col">
                        <p className="truncate font-semibold text-xl">
                            {strategy.base.symbol} / {strategy.quote.symbol}
                        </p>
                        <div className="flex items-center">
                            <p className="text-milk-400 text-xs">
                                deployed on {strategy.chains.length} chain{strategy.chains.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* for each chain */}
                {/* {[...strategy.chains, ...strategy.chains].map((chain, chainIndex, chains) => ( */}
                {strategy.chains
                    .filter((chain, index, chains) => chains.findIndex((c) => c.value.id === chain.value.id) === index)
                    .filter((chain) => chain.configurations.length > 0)
                    .map((chain, chainIndex, chains) => (
                        <div key={`${chain.value.id}-${chainIndex}`} className="w-full flex flex-col pl-7 overflow-hidden">
                            {/* row chain */}
                            <div className={cn('flex flex-col', chainIndex < chains.length - 1 ? 'border-l border-milk-200' : '')}>
                                {/* header */}
                                <div className={cn('flex items-end w-full gap-4')}>
                                    {/* row */}
                                    <div className="flex flex-col gap-4 h-full">
                                        <div
                                            className={cn(
                                                'border-b border-milk-200 pb-4 w-10 h-0 pt-4',
                                                chainIndex === chains.length - 1 ? 'border-l' : '',
                                            )}
                                        />
                                        <div className={cn('h-2')} />
                                    </div>

                                    {/* chain with details */}
                                    <button
                                        onClick={() => setExpandedChains((prev) => ({ ...prev, [chain.value.id]: !prev[chain.value.id] }))}
                                        className="w-full flex gap-2 items-center justify-between hover:bg-milk-50 rounded-xl px-3 py-2"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <ChainImage id={chain.value.id} size={24} />
                                            <p className="font-semibold text-xl pr-3">{chain.value.name}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-milk-400">
                                                {listTradesByChain(chain).length} trade
                                                {listTradesByChain(chain).length > 1 ? 's' : ''}
                                            </p>
                                            <p className="text-milk-400">|</p>
                                            <p className="text-milk-400">AUM: todo</p>
                                            <p className="text-milk-400">|</p>
                                            <p className="text-milk-400">x Instances</p>

                                            <div className="ml-10 p-2 hover:bg-milk-100 rounded-lg transition-colors">
                                                <IconWrapper
                                                    id={expandedChains[chain.value.id] ? IconIds.CHEVRON_UP : IconIds.CHEVRON_DOWN}
                                                    className="w-4 h-4"
                                                />
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* content */}
                                {expandedChains[chain.value.id] && <StrategyChain chain={chain} />}
                            </div>
                        </div>
                    ))}
            </div>

            {/* bottom lg:right */}
            {/* <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 border h-fit overflow-hidden">
                {listTrades(strategy).map((trade) => (
                    <div key={trade.id}>
                        <p>trade:{formatDate(trade.createdAt)}</p>
                        <pre>{JSON.stringify(trade, null, 2)}</pre>
                    </div>
                ))}
                <pre>{JSON.stringify(strategy, null, 2)}</pre>
            </div> */}
        </div>
    )
}

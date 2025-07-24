'use client'

import { useParams } from 'next/navigation'
import { useStrategies } from '@/hooks/fetchs/all/useStrategies'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import OneInchCandlestickChart from '@/components/charts/OneInchCandlestickChart'
import { formatDate, listTrades } from '@/utils'
// import StrategyChart from './StrategyChart'

export default function StrategyDetails() {
    const params = useParams()
    const strategyId = params.strategy as string
    const { isLoading, error, hasError, strategies } = useStrategies()

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
        <div className="w-full grid grid-cols-1 lg:grid-cols-11 gap-4">
            {/* top lg:left */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-4 border h-fit">
                <div className="flex flex-row gap-4 center p-4 items-center">
                    <DoubleSymbol symbolLeft={strategy.base.symbol} symbolRight={strategy.quote.symbol} size={36} gap={2} />
                    <p className="truncate font-light text-4xl">
                        {strategy.base.symbol} / {strategy.quote.symbol}
                    </p>
                </div>

                {strategy.chains.map((chain) => (
                    <div key={chain.value.id} className="flex flex-col gap-2 pl-16">
                        <div className="flex gap-2 items-center">
                            <ChainImage id={chain.value.id} size={24} />
                            <p className="font-light text-xl">{chain.value.name}</p>
                        </div>
                        {chain.configurations.map((configuration) => (
                            <div key={configuration.value.id} className="flex flex-col gap-2 pl-16">
                                <OneInchCandlestickChart configuration={configuration.value} className="h-[400px]" />
                                <p>configuration:{configuration.value.id}</p>
                                {configuration.instances.map((instance) => (
                                    <div key={instance.value.id} className="flex flex-col gap-2 pl-16">
                                        <p>instance:{instance.value.id}</p>
                                        {instance.value.trades.map((trade) => (
                                            <p key={trade.id}>--- trade:{trade.id}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* bottom lg:right */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 border h-fit overflow-hidden">
                {/* trades */}
                {listTrades(strategy).map((trade) => (
                    <div key={trade.id}>
                        <p>trade:{formatDate(trade.createdAt)}</p>
                        <pre>{JSON.stringify(trade, null, 2)}</pre>
                    </div>
                ))}

                {/* json */}
                <pre>{JSON.stringify(strategy, null, 2)}</pre>
            </div>
        </div>
    )
}

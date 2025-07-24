'use client'

import { useParams } from 'next/navigation'
import { useStrategies } from '@/hooks/fetchs/all/useStrategies'
import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
import OneInchCandlestickChart from '@/components/charts/OneInchCandlestickChart'
import { Strategy } from '@/types'
import { cn, formatDate, listTradesByChain, shortenValue } from '@/utils'
import { useState } from 'react'
import { TradeValues } from '@/interfaces'
import { Configuration, Trade } from '@prisma/client'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { AppSupportedChainIds } from '@/enums'

export function ConfigurationEntry({ configuration }: { configuration: Configuration }) {
    return (
        <div key={configuration.id} className="text-xs">
            <div className="w-full grid grid-cols-12 gap-4 bg-milk-50 hover:bg-milk-100 rounded-lg p-2">
                <p className="col-span-12 truncate">{formatDate(configuration.createdAt)}</p>
                {/* <LinkWrapper href={`${CHAINS_CONFIG[configuration.chainId].explorerRoot}/tx/${configuration.transactionHash}`} className="col-span-6 hover:underline">
                    <p>Tx: {shortenValue(configuration.transactionHash || 'no tx')}</p>
                </LinkWrapper> */}
            </div>
            {/* <pre>{JSON.stringify(trade.values, null, 2)}</pre> */}
        </div>
    )
}

export function TradeEntry({ trade, chain, index }: { trade: Trade; chain: AppSupportedChainIds; index: number }) {
    const castedValues = trade.values as unknown as TradeValues
    return (
        <div key={trade.id} className="text-xs">
            <div className="w-full grid grid-cols-12 gap-4 bg-milk-50 hover:bg-milk-100 rounded-lg p-2">
                <p className="col-span-2 truncate">{index + 1}</p>
                <p className="col-span-5 truncate">{formatDate(trade.createdAt)}</p>
                <LinkWrapper
                    href={`${CHAINS_CONFIG[chain].explorerRoot}/tx/${castedValues.payload.swap.receipt.transactionHash}`}
                    className="col-span-5 hover:underline"
                >
                    <p>Tx: {shortenValue(castedValues.payload.swap.receipt.transactionHash || 'no tx')}</p>
                </LinkWrapper>
            </div>
            {/* <pre>{JSON.stringify(trade.values, null, 2)}</pre> */}
        </div>
    )
}

export function StrategyChain({ chain }: { chain: Strategy['chains'][number] }) {
    const [activeTab, setActiveTab] = useState<'trades' | 'configurations' | 'inventory'>('trades')
    return (
        <div key={chain.value.id} className="flex flex-col gap-2 mt-4 text-xs pl-5">
            {chain.configurations.map((configuration) => (
                <div key={configuration.value.id} className="grid grid-cols-12 w-full gap-10">
                    <OneInchCandlestickChart configuration={configuration.value} trades={listTradesByChain(chain)} className="h-[400px] col-span-7" />
                    <div className="col-span-5 flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <button
                                className={cn('px-2.5 py-1 rounded-lg', activeTab === 'trades' ? 'bg-milk-100' : 'text-milk-400')}
                                onClick={() => setActiveTab('trades')}
                            >
                                <p>Trades</p>
                            </button>
                            <button
                                className={cn('px-2.5 py-1 rounded-lg', activeTab === 'configurations' ? 'bg-milk-100' : 'text-milk-400')}
                                onClick={() => setActiveTab('configurations')}
                            >
                                <p>Configurations</p>
                            </button>
                            <button
                                className={cn('px-2.5 py-1 rounded-lg', activeTab === 'inventory' ? 'bg-milk-100' : 'text-milk-400')}
                                onClick={() => setActiveTab('inventory')}
                            >
                                <p>Inventory</p>
                            </button>
                        </div>
                        {activeTab === 'trades' &&
                            listTradesByChain(chain).map((trade, index) => (
                                <TradeEntry key={trade.id} chain={chain.value.id} trade={trade} index={index} />
                            ))}
                        {activeTab === 'configurations' &&
                            chain.configurations.map((configuration) => (
                                <ConfigurationEntry key={configuration.value.id} configuration={configuration.value} />
                            ))}
                        {activeTab === 'inventory' && <p>configuration:{configuration.value.id}</p>}
                        {/* {configuration.instances.map((instance) => (
                            <div key={instance.value.id} className="flex flex-col gap-2 pl-16">
                                <p>instance:{instance.value.id}</p>
                                {instance.value.trades.map((trade) => (
                                    <p key={trade.id}>--- trade:{trade.id}</p>
                                ))}
                            </div>
                        ))} */}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function ListStrategyChains() {
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
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* top lg:left */}
            <div className="col-span-1 lg:col-span-12 flex flex-col h-fit">
                {/* pair */}
                <div className="flex flex-row gap-3 center items-center">
                    <DoubleSymbol symbolLeft={strategy.base.symbol} symbolRight={strategy.quote.symbol} size={56} gap={2} />
                    <div className="flex flex-col">
                        <p className="truncate font-semibold text-xl">
                            {strategy.base.symbol} / {strategy.quote.symbol}
                        </p>
                        <div className="flex items-center">
                            <p className="text-milk-400">
                                strategy deployed on {strategy.chains.length} chain{strategy.chains.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* for each chain */}
                {strategy.chains.map((chain, chainIndex, chains) => (
                    <div key={chain.value.id} className="w-full flex flex-col pl-7 border-milk-200 overflow-hidden">
                        {/* row chain */}
                        <div className="flex items-center w-full gap-4">
                            <div className="flex flex-col items-start h-full">
                                <div className="border-l border-milk-200 h-6" />
                                <div className="border-l border-b border-milk-200 pb-4 w-8 h-4" />
                                {chainIndex < chains.length - 1 && <div className="border-l border-milk-200 pb-4 w-10 h-4" />}
                            </div>
                            <div className="flex gap-2 items-center mt-10">
                                <ChainImage id={chain.value.id} size={24} />
                                <p className="font-semibold text-xl pr-3">{chain.value.name}</p>
                                <p className="text-milk-400">
                                    {listTradesByChain(chain).length} trade
                                    {listTradesByChain(chain).length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* content */}
                        <StrategyChain chain={chain} />
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

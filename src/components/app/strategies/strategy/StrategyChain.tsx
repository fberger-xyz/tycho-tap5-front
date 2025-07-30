'use client'

import { useState } from 'react'
import { cn, listTradesByChain } from '@/utils'
import { StrategyTabs } from '@/enums'
import ChartForPairOnChain from '@/components/charts/ChartForPairOnChain'
import { InstanceEntryHeader } from './InstanceEntry'
import { TradeEntry, TradeEntryHeader } from './TradeEntry'
import { InventoryDisplay } from './InventoryDisplay'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StrategyChain({ chain }: { chain: any }) {
    const [activeTab, setActiveTab] = useState<StrategyTabs>(StrategyTabs.TRADES)

    if (chain.configurations.length === 0) return null
    const parsedConfiguration = chain.configurations[0].parsedConfiguration

    return (
        <div key={chain.value.id} className="flex flex-col gap-2 text-xs ml-3 mt-2 bg-milk-50 rounded-xl">
            <div className="grid grid-cols-12 w-full">
                {parsedConfiguration.base.address && parsedConfiguration.quote.address && (
                    <ChartForPairOnChain
                        baseTokenAddress={parsedConfiguration.base.address}
                        quoteTokenAddress={parsedConfiguration.quote.address}
                        chainId={chain.value.id}
                        trades={listTradesByChain(chain)}
                        className="h-[360px] col-span-7 p-3"
                    />
                )}

                <div className="col-span-5 flex flex-col border-l border-milk-50 pl-3 pt-3 h-[360px] overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            className={cn('px-2.5 py-1 rounded-lg', activeTab === StrategyTabs.TRADES ? 'bg-milk-100' : 'text-milk-400')}
                            onClick={() => setActiveTab(StrategyTabs.TRADES)}
                        >
                            <p>{StrategyTabs.TRADES}</p>
                        </button>
                        <button
                            className={cn('px-2.5 py-1 rounded-lg', activeTab === StrategyTabs.INSTANCES ? 'bg-milk-100' : 'text-milk-400')}
                            onClick={() => setActiveTab(StrategyTabs.INSTANCES)}
                        >
                            <p>{StrategyTabs.INSTANCES}</p>
                        </button>
                        <button
                            className={cn('px-2.5 py-1 rounded-lg', activeTab === StrategyTabs.INVENTORY ? 'bg-milk-100' : 'text-milk-400')}
                            onClick={() => setActiveTab(StrategyTabs.INVENTORY)}
                        >
                            <p>{StrategyTabs.INVENTORY}</p>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-scroll overflow-x-hidden grow">
                        {activeTab === StrategyTabs.TRADES && (
                            <>
                                <TradeEntryHeader />
                                {listTradesByChain(chain).map((trade, index) => (
                                    <TradeEntry key={trade.id} chain={chain.value.id} trade={trade} index={index} />
                                ))}
                            </>
                        )}
                        {activeTab === StrategyTabs.INSTANCES && (
                            <>
                                <InstanceEntryHeader />
                                {/* {chain.configurations
                                    .flatMap((configuration) => configuration.instances)
                                    .map((instance, index) => (
                                        <InstanceEntry key={instance.value.id} instance={instance.value} index={index} />
                                    ))} */}
                            </>
                        )}
                        {activeTab === StrategyTabs.INVENTORY && parsedConfiguration.base.address && parsedConfiguration.quote.address && (
                            <InventoryDisplay
                                baseTokenAddress={parsedConfiguration.base.address}
                                quoteTokenAddress={parsedConfiguration.quote.address}
                                chain={chain}
                                walletAddress={parsedConfiguration.inventory.walletPublicKey}
                                // gasTokenSymbol={parsedConfiguration.execution.gasTokenSymbol}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

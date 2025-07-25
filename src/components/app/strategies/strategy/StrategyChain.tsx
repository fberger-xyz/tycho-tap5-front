'use client'

import { useState } from 'react'
import { Strategy } from '@/types'
import { cn, listTradesByChain } from '@/utils'
import { StrategyTabs } from '@/enums'
import ChartForPairOnChain from '@/components/charts/ChartForPairOnChain'
import { ConfigurationEntry } from './ConfigurationEntry'
import { TradeEntry, TradeEntryHeader } from './TradeEntry'
import { InventoryDisplay } from './InventoryDisplay'

export function StrategyChain({ chain }: { chain: Strategy['chains'][number] }) {
    const [activeTab, setActiveTab] = useState<StrategyTabs>(StrategyTabs.TRADES)

    if (chain.configurations.length === 0) return null
    const parsedConfiguration = chain.configurations[0].parsedConfiguration

    return (
        <div key={chain.value.id} className="flex flex-col gap-2 text-xs pl-5 pt-3">
            <div className="grid grid-cols-12 w-full gap-8">
                {parsedConfiguration.base.address && parsedConfiguration.quote.address && (
                    <ChartForPairOnChain
                        baseTokenAddress={parsedConfiguration.base.address}
                        quoteTokenAddress={parsedConfiguration.quote.address}
                        chainId={chain.value.id}
                        trades={listTradesByChain(chain)}
                        className="h-[350px] col-span-7"
                    />
                )}

                <div className="col-span-5 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
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
                    {activeTab === StrategyTabs.TRADES && (
                        <>
                            <TradeEntryHeader />
                            {listTradesByChain(chain).map((trade, index) => (
                                <TradeEntry key={trade.id} chain={chain.value.id} trade={trade} index={index} />
                            ))}
                        </>
                    )}
                    {activeTab === StrategyTabs.INSTANCES &&
                        chain.configurations.map((configuration) => (
                            <ConfigurationEntry key={configuration.value.id} configuration={configuration.value} />
                        ))}
                    {activeTab === StrategyTabs.INVENTORY && parsedConfiguration.base.address && parsedConfiguration.quote.address && (
                        <InventoryDisplay
                            baseTokenAddress={parsedConfiguration.base.address}
                            quoteTokenAddress={parsedConfiguration.quote.address}
                            chain={chain}
                            walletAddress={parsedConfiguration.inventory.walletPublicKey}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

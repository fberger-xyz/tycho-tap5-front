'use client'

import { useParams } from 'next/navigation'
import { useStrategies } from '@/hooks/fetchs/all/useStrategies'
import { ChainImage, DoubleSymbol, SymbolImage } from '@/components/common/ImageWrapper'
import ChartForPairOnChain from '@/components/charts/ChartForPairOnChain'
import { Strategy } from '@/types'
import { cn, formatDate, listTradesByChain, shortenValue } from '@/utils'
import { useState } from 'react'
import { TradeValues } from '@/interfaces'
import { Configuration, Trade } from '@prisma/client'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { AppSupportedChainIds } from '@/enums'
import { useInventories, formatTokenBalance } from '@/hooks/useInventories'

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

function InventoryDisplay({ configuration, chain }: { configuration: Configuration; chain: Strategy['chains'][number] }) {
    // Get wallet address and tokens from configuration
    const configValues = configuration.values as { wallet_public_key?: string; inventory?: { walletPublicKey?: string } }
    const walletAddress = configValues?.wallet_public_key || configValues?.inventory?.walletPublicKey

    // Get token addresses - include native ETH (0x0000...) to check ETH balance
    const baseTokenAddress = configuration.baseTokenAddress
    const quoteTokenAddress = configuration.quoteTokenAddress

    // Also include WETH if not already included
    const wethAddress =
        chain.value.id === 1
            ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // Ethereum WETH
            : '0x4200000000000000000000000000000000000006' // Unichain WETH

    const tokenAddresses = Array.from(
        new Set(
            [
                baseTokenAddress,
                quoteTokenAddress,
                wethAddress,
                '0x0000000000000000000000000000000000000000', // Native ETH
            ].filter(Boolean),
        ),
    )

    // Debug - log chain info
    console.log('Chain info:', { chainId: chain.value.id, chainName: chain.value.name })

    // Fetch balances
    const {
        data: balances,
        isLoading,
        error,
    } = useInventories({
        walletAddress,
        tokenAddresses,
        chainId: chain.value.id,
        enabled: !!walletAddress && tokenAddresses.length > 0,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-4">
                <p className="text-milk-400 text-sm">Loading inventory...</p>
            </div>
        )
    }

    if (error || !balances) {
        return (
            <div className="flex items-center justify-center py-4">
                <p className="text-red-500 text-sm">Failed to load inventory</p>
            </div>
        )
    }

    if (!walletAddress) {
        return (
            <div className="flex items-center justify-center py-4">
                <p className="text-milk-400 text-sm">No wallet address found</p>
            </div>
        )
    }

    const getTokenSymbol = (address: string) => {
        const lowerAddress = address.toLowerCase()
        if (lowerAddress === baseTokenAddress?.toLowerCase()) return configuration.baseTokenSymbol
        if (lowerAddress === quoteTokenAddress?.toLowerCase()) return configuration.quoteTokenSymbol
        if (lowerAddress === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') return 'WETH'
        if (lowerAddress === '0x4200000000000000000000000000000000000006') return 'WETH'
        if (lowerAddress === '0x0000000000000000000000000000000000000000') return 'ETH'
        return 'Unknown'
    }

    return (
        <div className="flex flex-col gap-3">
            <LinkWrapper
                target="_blank"
                // href={`${CHAINS_CONFIG[chain.value.id].explorerRoot}/address/${walletAddress}`}
                href={`https://debank.com/profile/${walletAddress}`}
                className="text-xs text-milk-400 mb-2 hover:underline"
            >
                Wallet: {shortenValue(walletAddress)}
            </LinkWrapper>
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold border-b border-milk-100 pb-2">
                <p>Asset</p>
                <p className="text-right">Balance</p>
                <p className="text-right">Unit price</p>
                <p className="text-right">Total value</p>
            </div>
            {balances.map((balance) => {
                const symbol = balance.symbol || getTokenSymbol(balance.address)
                const formattedBalance = formatTokenBalance(balance.balance, balance.decimals)
                const displayBalance = parseFloat(formattedBalance).toFixed(6)

                return (
                    <div key={balance.address} className="grid grid-cols-4 gap-2 text-xs py-2 hover:bg-milk-50 rounded-lg px-1">
                        <div className="flex items-center gap-2">
                            <SymbolImage symbol={symbol} size={16} />
                            <p>{symbol.toUpperCase()}</p>
                        </div>
                        <p className="text-right font-mono">{displayBalance}</p>
                        <p className="text-right text-milk-400">$-</p>
                        <p className="text-right text-milk-400">$-</p>
                    </div>
                )
            })}
            <div className="border-t border-milk-100 pt-2 mt-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                    <p className="col-span-3">Total Portfolio Value</p>
                    <p className="text-right">$-</p>
                </div>
            </div>
        </div>
    )
}

export function StrategyChain({ chain }: { chain: Strategy['chains'][number] }) {
    const [activeTab, setActiveTab] = useState<'trades' | 'configurations' | 'inventory'>('trades')
    return (
        <div key={chain.value.id} className="flex flex-col gap-2 text-xs pl-5 pt-3">
            {chain.configurations.map((configuration) => (
                <div key={configuration.value.id} className="grid grid-cols-12 w-full gap-10">
                    <ChartForPairOnChain configuration={configuration.value} trades={listTradesByChain(chain)} className="h-[400px] col-span-7" />
                    <div className="col-span-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
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
                        {activeTab === 'inventory' && <InventoryDisplay configuration={configuration.value} chain={chain} />}
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
                {strategy.chains.map((chain, chainIndex, chains) => (
                    <div key={`${chain.value.id}-${chainIndex}`} className="w-full flex flex-col pl-7 overflow-hidden">
                        {/* row chain */}
                        <div className={cn('flex flex-col', chainIndex < chains.length - 1 ? 'border-l border-milk-200' : '')}>
                            {/* header */}
                            <div className={cn('flex items-end w-full gap-4')}>
                                {/* row */}
                                <div className="flex flex-col items-start h-full">
                                    <div
                                        className={cn(
                                            'border-b border-milk-200 pb-4 w-10 h-0 pt-4',
                                            chainIndex === chains.length - 1 ? 'border-l' : '',
                                        )}
                                    />
                                    <div className={cn('h-3')} />
                                </div>

                                {/* chain with details */}
                                <div className="flex gap-2 items-center">
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

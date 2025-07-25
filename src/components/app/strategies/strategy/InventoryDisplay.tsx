'use client'

import { Strategy } from '@/types'
import { shortenValue } from '@/utils'
import { SymbolImage } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { useInventories, formatTokenBalance } from '@/hooks/useInventories'
import { getTokenByAddress } from '@/config/tokens.config'

export function InventoryDisplay({
    baseTokenAddress,
    quoteTokenAddress,
    chain,
    walletAddress,
}: {
    baseTokenAddress: string
    quoteTokenAddress: string
    chain: Strategy['chains'][number]
    walletAddress: string
}) {
    // Debug - log chain info
    console.log('Chain info:', { chainId: chain.value.id, chainName: chain.value.name })

    // Fetch balances
    const {
        data: balances,
        isLoading,
        error,
    } = useInventories({
        walletAddress,
        tokenAddresses: [baseTokenAddress, quoteTokenAddress],
        chainId: chain.value.id,
        enabled: !!walletAddress,
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
                const symbol = getTokenByAddress(chain.value.id, balance.address)?.symbol || balance.symbol
                const formattedBalance = formatTokenBalance(balance.balance, balance.decimals)
                const displayBalance = parseFloat(formattedBalance).toFixed(6)

                return (
                    <div key={balance.address} className="grid grid-cols-4 gap-2 text-xs py-2 hover:bg-milk-50 rounded-lg px-1">
                        <div className="flex items-center gap-2">
                            <SymbolImage symbol={symbol} size={16} />
                            <p>{symbol?.toUpperCase() || 'Unknown'}</p>
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

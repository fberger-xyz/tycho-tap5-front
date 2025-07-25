'use client'

import { Configuration } from '@prisma/client'
import { Strategy } from '@/types'
import { shortenValue } from '@/utils'
import { SymbolImage } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { useInventories, formatTokenBalance } from '@/hooks/useInventories'

export function InventoryDisplay({ configuration, chain }: { configuration: Configuration; chain: Strategy['chains'][number] }) {
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

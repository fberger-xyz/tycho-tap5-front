'use client'

import { Strategy } from '@/types'
import { cn, shortenValue } from '@/utils'
import { SymbolImage } from '@/components/common/ImageWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'
import { useInventories, formatTokenBalance } from '@/hooks/useInventories'
import { getTokenByAddress } from '@/config/tokens.config'
import { CHAINS_CONFIG } from '@/config/chains.config'
import StyledTooltip from '@/components/common/StyledTooltip'
import { RoundedAmount } from '@/components/common/RoundedAmount'
import numeral from 'numeral'
import { ErrorTemplate, LoadingTemplate, NotFoundTemplate } from '@/components/app/shared/PlaceholderTemplates'

export function InventoryEntryTemplate(props: {
    asset: React.ReactNode
    balance: React.ReactNode
    unitPrice: React.ReactNode
    totalValue: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('grid grid-cols-4 gap-2 text-xs pl-1', props.className)}>
            <div className="col-span-1">{props.asset}</div>
            <div className="col-span-1 text-right">{props.balance}</div>
            <div className="col-span-1 text-right">{props.unitPrice}</div>
            <div className="col-span-1 text-right">{props.totalValue}</div>
        </div>
    )
}

export function InventoryEntryHeader() {
    return (
        <InventoryEntryTemplate
            asset={<p>Asset</p>}
            balance={<p>Balance</p>}
            unitPrice={<p>Unit price</p>}
            totalValue={<p>Total value</p>}
            className="text-milk-200 font-semibold border-b border-milk-100 pb-2"
        />
    )
}

export function InventoryDisplay({
    baseTokenAddress,
    quoteTokenAddress,
    chain,
    walletAddress,
    gasTokenSymbol,
}: {
    baseTokenAddress: string
    quoteTokenAddress: string
    chain: Strategy['chains'][number]
    walletAddress: string
    gasTokenSymbol?: string
}) {
    // Fetch balances including native token
    const {
        data: balances,
        isLoading,
        error,
    } = useInventories({
        walletAddress,
        tokenAddresses: [baseTokenAddress, quoteTokenAddress],
        chainId: chain.value.id,
        enabled: !!walletAddress,
        includeNative: true,
    })

    if (isLoading) return <LoadingTemplate entryName="inventory" />
    if (error || !balances) return <ErrorTemplate entryName="inventory" />
    if (!walletAddress) return <NotFoundTemplate entryName="wallet" />

    return (
        <div className="flex flex-col gap-2 pl-2 pr-4">
            <StyledTooltip content={walletAddress}>
                <LinkWrapper
                    target="_blank"
                    href={`https://debank.com/profile/${walletAddress}`}
                    className="text-xs text-milk-400 hover:underline mb-2"
                >
                    Wallet: {shortenValue(walletAddress)}
                </LinkWrapper>
            </StyledTooltip>

            <InventoryEntryHeader />

            {balances.map((balance, index) => {
                // Check if this is the native token (AddressZero)
                const isNativeToken = balance.address.toLowerCase() === '0x0000000000000000000000000000000000000000'

                let displayName: string

                if (isNativeToken) {
                    // For native token, always use ETH or the configured native symbol
                    const nativeSymbol = CHAINS_CONFIG[chain.value.id]?.nativeToken?.symbol || 'ETH'
                    displayName = gasTokenSymbol || nativeSymbol
                } else {
                    // For ERC20 tokens, first try to get from tokens config, then fall back to balance symbol
                    const tokenConfig = getTokenByAddress(chain.value.id, balance.address)

                    if (tokenConfig && tokenConfig.symbol !== 'unknown') {
                        displayName = tokenConfig.symbol
                    } else if (balance.symbol && !balance.symbol.startsWith('0x')) {
                        displayName = balance.symbol
                    } else {
                        // If no symbol found or symbol is an address, show shortened address
                        displayName = shortenValue(balance.address)
                    }
                }

                const formattedBalance = formatTokenBalance(balance.balance, balance.decimals)
                const displayBalance = parseFloat(formattedBalance)

                return (
                    <InventoryEntryTemplate
                        key={balance.address}
                        asset={
                            <div className="flex items-center gap-2">
                                <p className="text-milk-200 w-4">{index + 1}.</p>
                                <SymbolImage
                                    symbol={displayName}
                                    size={16}
                                    className="grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                                />
                                <StyledTooltip content={isNativeToken ? `Native Token (${balance.address})` : balance.address}>
                                    <p>{displayName.toUpperCase()}</p>
                                </StyledTooltip>
                            </div>
                        }
                        balance={
                            <RoundedAmount amount={displayBalance} className="font-mono">
                                {numeral(displayBalance).format('0,0.000000')}
                            </RoundedAmount>
                        }
                        unitPrice={<p className="text-milk-400">$-</p>}
                        totalValue={<p className="text-milk-400">$-</p>}
                        className="text-milk-400 hover:text-milk hover:bg-milk-50 rounded-lg transition-all duration-200 group"
                    />
                )
            })}

            <div className="border-t border-milk-100 pt-2 mt-2">
                <InventoryEntryTemplate
                    asset={<p className="font-semibold">Total Portfolio Value</p>}
                    balance={null}
                    unitPrice={null}
                    totalValue={<p className="font-semibold">$-</p>}
                    className="text-milk-200"
                />
            </div>
        </div>
    )
}

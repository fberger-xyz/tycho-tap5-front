import Card from '@/components/figma/Card'
import { SymbolImage } from '@/components/common/ImageWrapper'
import numeral from 'numeral'
import { cleanOutput } from '@/utils/format.util'

interface Token {
    id: string
    symbol: string | null
    optimized_symbol?: string | null
    amount: number
    price: number
}

interface StrategyInventoryProps {
    tokens: Token[]
    isLoading?: boolean
}

export default function StrategyInventory({ tokens, isLoading }: StrategyInventoryProps) {
    // Filter and sort tokens
    const displayTokens = tokens.filter((token) => token.price > 0.01).sort((a, b) => b.amount * b.price - a.amount * a.price)

    return (
        <Card className="gap-5 px-0 pb-0">
            <div className="flex justify-between px-5 items-center">
                <h1 className="text-lg font-semibold font-inter-tight">Your Funds</h1>
            </div>
            <div className="flex flex-col text-xs">
                <div className="grid grid-cols-2 px-5 mb-3">
                    <p className="text-milk-600 truncate">Asset</p>
                    <p className="text-milk-600 truncate">Size</p>
                </div>
                {isLoading ? (
                    <div className="px-5 py-4">
                        <p className="text-milk-400 text-center">Loading...</p>
                    </div>
                ) : displayTokens.length === 0 ? (
                    <p className="text-milk-400 text-center py-4">No tokens found</p>
                ) : (
                    displayTokens.map((token) => (
                        <div key={token.id} className="grid grid-cols-2 items-center border-t border-milk-100 py-3 px-5">
                            <div className="flex items-center gap-2">
                                <SymbolImage symbol={token.optimized_symbol || token.symbol || undefined} size={20} />
                                <p className="truncate">{token.optimized_symbol || token.symbol || 'Unknown'}</p>
                            </div>
                            <p className="truncate">
                                {token.amount.toFixed(4)}{' '}
                                {token.price > 0 && (
                                    <span className="text-xs text-milk-400 ml-2">
                                        {cleanOutput(`($${numeral(token.amount * token.price).format('0,0.[00]')})`)}
                                    </span>
                                )}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}

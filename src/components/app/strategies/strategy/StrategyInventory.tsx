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
            <div className="flex items-center justify-between px-5">
                <h1 className="font-inter-tight text-lg font-semibold">Your Funds</h1>
            </div>
            <div className="flex flex-col text-xs">
                <div className="mb-3 grid grid-cols-2 px-5">
                    <p className="truncate text-milk-600">Asset</p>
                    <p className="truncate text-milk-600">Size</p>
                </div>
                {isLoading ? (
                    <div className="px-5 py-4">
                        <p className="text-center text-milk-400">Loading...</p>
                    </div>
                ) : displayTokens.length === 0 ? (
                    <p className="py-4 text-center text-milk-400">No tokens found</p>
                ) : (
                    displayTokens.map((token) => (
                        <div key={token.id} className="grid grid-cols-2 items-center border-t border-milk-100 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <SymbolImage symbol={token.optimized_symbol || token.symbol || undefined} size={20} />
                                <p className="truncate">{token.optimized_symbol || token.symbol || 'Unknown'}</p>
                            </div>
                            <p className="truncate">
                                {token.amount.toFixed(4)}{' '}
                                {token.price > 0 && (
                                    <span className="ml-2 text-xs text-milk-400">
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

import Card from '@/components/figma/Card'
import UsdAmount from '@/components/figma/UsdAmount'
import LinkWrapper from '@/components/common/LinkWrapper'
import Skeleton from '@/components/common/Skeleton'

interface StrategyKPIsProps {
    aum?: number
    priceUsd?: number
    priceSourceUrl?: string | null
    isLoading?: boolean
}

export default function StrategyKPIs({ aum, priceUsd, priceSourceUrl, isLoading }: StrategyKPIsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <p className="text-xs text-milk-600">PnL</p>
                {isLoading ? <Skeleton variant="text" /> : <p className="truncate text-lg text-milk-200">To be computed</p>}
            </Card>
            <Card>
                <p className="text-xs text-milk-600">AUM</p>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : aum ? (
                    <UsdAmount amountUsd={aum} className="hover:underline" textClassName="text-lg" />
                ) : (
                    <p className="truncate text-lg text-milk-200">$0.00</p>
                )}
            </Card>
            <Card>
                <p className="text-xs text-milk-600">Price</p>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : priceSourceUrl ? (
                    <LinkWrapper href={priceSourceUrl} target="_blank">
                        <UsdAmount amountUsd={priceUsd || 0} className="cursor-alias hover:underline" textClassName="text-lg" />
                    </LinkWrapper>
                ) : (
                    <UsdAmount amountUsd={priceUsd || 0} textClassName="text-lg" />
                )}
            </Card>
        </div>
    )
}

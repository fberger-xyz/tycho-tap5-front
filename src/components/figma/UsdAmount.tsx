import numeral from 'numeral'
import { PercentEvolution } from './Tags'
import { cn } from '@/utils'

export default function UsdAmount({
    amountUsd,
    variationPercentage,
    decimals = 0,
    className,
}: {
    amountUsd: number
    variationPercentage?: number
    decimals?: number
    className?: string
}) {
    return (
        <div className={cn('flex gap-2 items-center', className)}>
            <p className="text-base font-semibold">{numeral(amountUsd).format(`$0,0.${'0'.repeat(decimals)}`)}</p>
            {variationPercentage && <PercentEvolution percentage={variationPercentage} />}
        </div>
    )
}

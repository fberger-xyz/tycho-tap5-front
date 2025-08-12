import numeral from 'numeral'
import { PercentEvolution } from './Tags'
import { cn } from '@/utils'

export default function UsdAmount({
    amountUsd,
    variationPercentage,
    decimals = 0,
    className,
    textClassName = 'text-base',
}: {
    amountUsd: number
    variationPercentage?: number
    decimals?: number
    className?: string
    textClassName?: string
}) {
    return (
        <div className={cn('flex gap-2 items-center', className)}>
            <p className={cn('font-semibold', textClassName)}>{numeral(amountUsd).format(`$0,0.${'0'.repeat(decimals)}`)}</p>
            {variationPercentage !== undefined && <PercentEvolution percentage={variationPercentage} />}
        </div>
    )
}

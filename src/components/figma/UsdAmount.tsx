import numeral from 'numeral'
import { PercentEvolution } from './Tags'

export default function UsdAmount({
    amountUsd,
    variationPercentage,
    decimals = 0,
}: {
    amountUsd: number
    variationPercentage?: number
    decimals?: number
}) {
    return (
        <div className="flex gap-2 items-center">
            <p className="text-base font-semibold">{numeral(amountUsd).format(`$0,0.${'0'.repeat(decimals)}`)}</p>
            {variationPercentage && <PercentEvolution percentage={variationPercentage} />}
        </div>
    )
}

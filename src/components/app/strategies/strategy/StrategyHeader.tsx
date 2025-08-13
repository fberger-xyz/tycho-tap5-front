import React from 'react'
import { ButtonDark } from '@/components/figma/Button'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { DoubleSymbol, ChainImage } from '@/components/common/ImageWrapper'
import { TargetSpread } from '@/components/figma/Tags'
import { useRouter } from 'next/navigation'

interface StrategyHeaderProps {
    baseSymbol: string
    quoteSymbol: string
    chainId: number
    chainName: string
    targetSpread?: number
}

export default function StrategyHeader({ baseSymbol, quoteSymbol, chainId, chainName, targetSpread }: StrategyHeaderProps) {
    const router = useRouter()

    return (
        <>
            {/* Left side */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-fit">
                <ButtonDark onClick={() => router.back()} className="px-[9px] py-[9px] rounded-xl">
                    <IconWrapper id={IconIds.ARROW_LEFT} className="size-4" />
                </ButtonDark>
                <div className="flex gap-4 items-center">
                    <DoubleSymbol symbolLeft={baseSymbol} symbolRight={quoteSymbol} size={48} gap={2} />
                    <div className="flex flex-col gap-1 grow items-start md:w-1/3">
                        <div className="flex gap-2 items-center">
                            <p className="text-lg font-semibold truncate text-milk">
                                {baseSymbol} / {quoteSymbol}
                            </p>
                            {targetSpread && <TargetSpread bpsAmount={targetSpread} rounded="rounded" />}
                        </div>
                        <div className="flex gap-2">
                            <ChainImage id={chainId} size={20} />
                            <p className="truncate text-milk-600 text-sm capitalize">{chainName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - removed non-functional buttons */}
            <div className="flex gap-2">
                <ButtonDark onClick={() => router.push('/strategies')} className="px-3 py-2 rounded-xl">
                    <p className="text-sm">View All Strategies</p>
                </ButtonDark>
            </div>
        </>
    )
}

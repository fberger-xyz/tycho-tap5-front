import { ButtonDark, ButtonDanger } from '@/components/figma/Button'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { DoubleSymbol, ChainImage } from '@/components/common/ImageWrapper'
import StyledTooltip from '@/components/common/StyledTooltip'
import { useRouter } from 'next/navigation'
import { TargetSpread } from '@/components/figma/Tags'

interface StrategyHeaderProps {
    baseSymbol?: string
    quoteSymbol?: string
    chainId?: number
    chainName?: string
    targetSpreadBps?: number
    isLoading: boolean
}

export default function StrategyHeader({ baseSymbol, quoteSymbol, chainId, chainName, targetSpreadBps, isLoading }: StrategyHeaderProps) {
    const router = useRouter()

    if (isLoading || !baseSymbol || !quoteSymbol || !chainId || !chainName) {
        return (
            <>
                {/* Left side */}
                <div className="flex items-center gap-4 w-full md:w-fit">
                    <ButtonDark onClick={() => router.back()} className="px-[9px] py-[9px] rounded-xl">
                        <IconWrapper id={IconIds.ARROW_LEFT} className="size-4" />
                    </ButtonDark>
                    <div className="flex gap-4 items-center">
                        <DoubleSymbol symbolLeft={''} symbolRight={''} size={48} gap={2} />
                        <div className="flex flex-col gap-1 grow items-start md:w-1/3">
                            <div className="flex gap-2 items-center">
                                <div className="skeleton-loading h-6 w-24 rounded-lg" />
                                <div className="skeleton-loading h-6 w-24 rounded-lg" />
                            </div>
                            <div className="flex gap-2">
                                <div className="skeleton-loading size-6 rounded-full" />
                                <div className="skeleton-loading h-6 w-24 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex gap-2">
                    <StyledTooltip content="Coming soon: Control the market maker directly from your wallet">
                        <ButtonDanger className="w-max rounded-xl">
                            <IconWrapper id={IconIds.STOP_TRADING} className="size-4" />
                            <p className="text-sm truncate">Stop strategy</p>
                        </ButtonDanger>
                    </StyledTooltip>
                    <ButtonDark onClick={() => alert('To be implemented')} className="px-[10px] py-[7px] rounded-xl">
                        <IconWrapper id={IconIds.DOTS_HORIZONTAL} />
                    </ButtonDark>
                </div>
            </>
        )
    }

    return (
        <>
            {/* Left side */}
            <div className="flex items-center gap-4 w-full md:w-fit">
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
                            {targetSpreadBps && <TargetSpread bpsAmount={targetSpreadBps} />}
                        </div>
                        <div className="flex gap-2">
                            <ChainImage id={chainId} size={20} />
                            <p className="truncate text-milk-600 text-sm capitalize">{chainName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side */}
            <div className="flex gap-2">
                <StyledTooltip content="Coming soon: Control the market maker directly from your wallet">
                    <ButtonDanger className="w-max rounded-xl">
                        <IconWrapper id={IconIds.STOP_TRADING} className="size-4" />
                        <p className="text-sm truncate">Stop strategy</p>
                    </ButtonDanger>
                </StyledTooltip>
                <ButtonDark onClick={() => alert('To be implemented')} className="px-[10px] py-[7px] rounded-xl">
                    <IconWrapper id={IconIds.DOTS_HORIZONTAL} />
                </ButtonDark>
            </div>
        </>
    )
}

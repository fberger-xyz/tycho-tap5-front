'use client'

import PageWrapper from '@/components/common/PageWrapper'
import { useParams } from 'next/navigation'
import { useConfiguration } from '@/hooks/fetchs/useConfiguration'
import { useTradesData } from '@/hooks/fetchs/useTradesData'
import Skeleton from '@/components/common/Skeleton'
import { ErrorPlaceholder, NotFoundPlaceholder } from '@/components/app/shared/PlaceholderTemplates'
import StrategyTemplate from '@/components/app/strategies/strategy/StrategyTemplate'
import Card from '@/components/figma/Card'
import { DoubleSymbol } from '@/components/common/ImageWrapper'
import { Button, ButtonDanger } from '@/components/figma/Button'
import { IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import { useRouter } from 'next/navigation'

export default function StrategyPage() {
    const router = useRouter()

    // params
    const { strategy: strategyId } = useParams()

    // fetchs
    const {
        configuration,
        // instances,
        // totalTradesCount,
        isLoading: configLoading,
        hasError: configHasError,
        error: configError,
    } = useConfiguration(strategyId || '')
    const {
        // trades,
        isLoading: tradesLoading,
        hasError: tradesHasError,
        error: tradesError,
    } = useTradesData(5000, strategyId ? (Array.isArray(strategyId) ? strategyId[0] : strategyId) : undefined)

    // errors
    if (!strategyId) return <NotFoundPlaceholder entryName="Strategy" />
    if (!configuration) return <NotFoundPlaceholder entryName="Configuration" />

    // loading
    const isLoading = configLoading || tradesLoading
    const hasError = configHasError || tradesHasError

    // loading or error
    if (isLoading) {
        return (
            <PageWrapper className="max-w-[1400px]">
                <StrategyTemplate
                    header={
                        <>
                            <div className="skeleton-loading h-[52px] rounded-lg w-full" />
                            <div className="skeleton-loading h-[52px] rounded-lg w-full" />
                        </>
                    }
                    kpis={
                        <div className="grid grid-cols-3 gap-4">
                            <div className="skeleton-loading h-[88px] rounded-lg w-full" />
                            <div className="skeleton-loading h-[88px] rounded-lg w-full" />
                            <div className="skeleton-loading h-[88px] rounded-lg w-full" />
                        </div>
                    }
                    chart={<div className="skeleton-loading h-[420px] w-full rounded-lg" />}
                    trades={<div className="skeleton-loading h-[240px] w-full rounded-lg" />}
                    inventory={<div className="skeleton-loading h-[240px] w-full rounded-lg" />}
                    configurations={<div className="skeleton-loading h-[320px] w-full rounded-lg" />}
                />
            </PageWrapper>
        )
    }

    // error
    if (hasError) {
        const errorMessage = configError?.message || tradesError?.message || 'An error occurred'
        return <ErrorPlaceholder entryName="Configuration" errorMessage={errorMessage} />
    }

    // render
    return (
        <PageWrapper className="max-w-[1400px]">
            <StrategyTemplate
                header={
                    <>
                        <div className="flex items-center gap-4 grow">
                            <Button onClick={() => router.back()}>
                                <IconWrapper id={IconIds.ARROW_LEFT} />
                            </Button>
                            <DoubleSymbol symbolLeft={'?'} symbolRight={'?'} size={48} gap={2} />
                            <div className="flex flex-col gap-2 w-1/4">
                                <div className="flex gap-2">
                                    <Skeleton variant="text" />
                                    <div className="flex gap-1">
                                        <Skeleton variant="text" className="w-12" />
                                        <Skeleton variant="text" className="w-12" />
                                    </div>
                                </div>
                                <Skeleton variant="text" className="w-1/2" />
                            </div>
                        </div>

                        {/* right */}
                        <div className="flex gap-2">
                            <ButtonDanger onClick={() => router.back()}>
                                <IconWrapper id={IconIds.STOP_TRADING} />
                                <p className="text-sm">Stop strategy</p>
                            </ButtonDanger>
                            <Button onClick={() => router.back()}>
                                <IconWrapper id={IconIds.DOTS_HORIZONTAL} />
                            </Button>
                        </div>
                    </>
                }
                kpis={
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <p className="text-sm text-milk-400">Total PnL</p>
                            <Skeleton variant="text" />
                        </Card>
                        <Card>
                            <p className="text-sm text-milk-400">AUM</p>
                            <Skeleton variant="text" />
                        </Card>
                        <Card>
                            <p className="text-sm text-milk-400">Price</p>
                            <Skeleton variant="text" />
                        </Card>
                    </div>
                }
                chart={<div className="skeleton-loading h-[420px] w-full rounded-lg" />}
                trades={
                    <Card className="gap-5">
                        <div className="flex gap-6">
                            <h1 className="text-lg font-semibold">Your positions</h1>
                            <h1 className="text-lg text-milk-400">Deposits & Withdrawals</h1>
                        </div>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Asset</p>
                                <p className="truncate">Size</p>
                            </div>
                        </div>
                    </Card>
                }
                inventory={
                    <Card className="gap-5">
                        <h1 className="text-lg font-semibold">Your positions</h1>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Asset</p>
                                <p className="truncate">Size</p>
                            </div>
                        </div>
                    </Card>
                }
                configurations={
                    <Card className="gap-5">
                        <h1 className="text-lg font-semibold">Stats</h1>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Running time</p>
                                <p className="truncate">8 hours 23 minutes</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Chain</p>
                                <p className="truncate">Unichain</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Latest Price</p>
                                <p className="truncate">1 USDC = 0.000272186 ETH</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Target Spread</p>
                                <p className="truncate">5 bps</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Total trades</p>
                                <p className="truncate">11</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Max Slippage</p>
                                <p className="truncate">0 bps</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Daily Gas Budget</p>
                                <p className="truncate">Not set</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Price Updates</p>
                                <p className="truncate">18</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">Price Feed</p>
                                <p className="truncate">Binance</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-milk-400 truncate">EOA</p>
                                <p className="truncate">0xF...FD6</p>
                            </div>
                        </div>
                    </Card>
                }
            />
        </PageWrapper>
    )
}

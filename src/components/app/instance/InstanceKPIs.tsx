'use client'

import { useState, useEffect, ReactNode } from 'react'
import { formatDistance } from 'date-fns'
import numeral from 'numeral'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { AppColors } from '@/config'
import { cn } from '@/utils'
import { ChainImage, SymbolImage } from '@/components/common/ImageWrapper'
import StyledTooltip from '@/components/common/StyledTooltip'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { useInstancesData } from '@/hooks/fetchs/useInstancesData'
import { usePricesData } from '@/hooks/fetchs/usePricesData'
import { EnrichedInstance } from '@/types'

export function KPICard({ title, content, className }: { title: ReactNode; content: ReactNode; className?: string }) {
    return (
        <div className={cn('bg-milk-50 rounded-lg p-3 space-y-2', className)}>
            <div className="text-milk-400 text-xs font-medium">{title}</div>
            <div className="text-milk text-sm font-semibold">{content}</div>
        </div>
    )
}

export default function InstanceKPIs({ instance }: { instance: EnrichedInstance }) {
    const { refetch: refetchInstances } = useInstancesData()
    const { data: pricesData, refetch: refetchPrices } = usePricesData(instance.instance.id)
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())

    // Configuration values
    const config = instance.config?.values as {
        target_spread_bps?: number
        slippage_bps?: number
        gas_settings?: {
            daily_budget?: string
        }
        broadcast_url?: string
        price_feed_config?: {
            type?: string
        }
        protocol_version?: string
    }
    const targetSpread = config?.target_spread_bps || 0
    const slippage = config?.slippage_bps || 0
    const gasSettings = config?.gas_settings || {}

    // Calculate running time
    const runningTime = formatDistance(
        new Date(instance.instance.startedAt),
        instance.instance.endedAt ? new Date(instance.instance.endedAt) : new Date(),
        { addSuffix: false },
    )

    // Get latest price from prices data
    const latestPrice = pricesData?.[0]?.price || 0
    const priceChange24h =
        pricesData && pricesData.length > 1
            ? ((latestPrice - pricesData[pricesData.length - 1].price) / pricesData[pricesData.length - 1].price) * 100
            : 0

    // Auto refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetchInstances()
            refetchPrices()
            setLastUpdateTime(Date.now())
        }, 30000)

        return () => clearInterval(interval)
    }, [refetchInstances, refetchPrices])

    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
            {/* Status */}
            <KPICard
                title={
                    <div className="flex items-center gap-1">
                        <div className={cn('w-2 h-2 rounded-full', instance.instance.endedAt ? 'bg-red-500' : 'bg-green-500 animate-pulse')} />
                        <span>Status</span>
                    </div>
                }
                content={
                    <div className="flex items-center gap-2">
                        <span className={cn('font-semibold', instance.instance.endedAt ? 'text-red-400' : 'text-green-400')}>
                            {instance.instance.endedAt ? 'Stopped' : 'Running'}
                        </span>
                    </div>
                }
            />

            {/* Running Time */}
            <KPICard
                title="Running Time"
                content={
                    <div className="flex items-center justify-between">
                        <span>{runningTime}</span>
                        <CountdownCircleTimer
                            isPlaying={!instance.instance.endedAt}
                            duration={30}
                            initialRemainingTime={30 - (Date.now() - lastUpdateTime) / 1000}
                            colors={AppColors.aquamarine as `#${string}`}
                            trailColor={AppColors.milk[50] as `#${string}`}
                            size={20}
                            strokeWidth={2}
                            trailStrokeWidth={2}
                        >
                            {({ remainingTime }) => <span className="text-[8px] text-milk-400">{remainingTime}</span>}
                        </CountdownCircleTimer>
                    </div>
                }
            />

            {/* Trading Pair */}
            <KPICard
                title="Trading Pair"
                content={
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <SymbolImage symbol={instance.baseSymbol} size={20} />
                            <SymbolImage symbol={instance.quoteSymbol} size={20} />
                        </div>
                        <span>
                            {instance.baseSymbol}/{instance.quoteSymbol}
                        </span>
                    </div>
                }
            />

            {/* Latest Price */}
            <KPICard
                title={
                    <div className="flex items-center gap-1">
                        <span>Latest Price</span>
                        {priceChange24h !== 0 && (
                            <span className={cn('text-xs', priceChange24h > 0 ? 'text-green-400' : 'text-red-400')}>
                                {priceChange24h > 0 ? '+' : ''}
                                {numeral(priceChange24h).format('0.00')}%
                            </span>
                        )}
                    </div>
                }
                content={
                    latestPrice > 0 ? (
                        <div className="flex items-center gap-1">
                            <span>{numeral(latestPrice).format('0,0.0000')}</span>
                            <span className="text-milk-400 text-xs">{instance.quoteSymbol}</span>
                        </div>
                    ) : (
                        <div className="skeleton-loading h-6 w-24 rounded" />
                    )
                }
            />

            {/* Target Spread */}
            <KPICard
                title={
                    <StyledTooltip content="The target spread in basis points that the bot aims to maintain" placement="top">
                        <div className="flex items-center gap-1 cursor-help">
                            <span>Target Spread</span>
                            <IconWrapper id={IconIds.INFORMATION} className="size-3 text-milk-400" />
                        </div>
                    </StyledTooltip>
                }
                content={
                    <div className="flex items-center gap-1">
                        <span>{targetSpread}</span>
                        <span className="text-milk-400 text-xs">bps</span>
                    </div>
                }
            />

            {/* Trade Count */}
            <KPICard
                title="Total Trades"
                content={
                    <div className="flex items-center justify-between">
                        <span>{numeral(instance.instance._count.Trade).format('0,0')}</span>
                        <div className="flex items-center gap-1">
                            <ChainImage id={instance.chainId} size={16} />
                        </div>
                    </div>
                }
            />

            {/* Slippage Tolerance */}
            <KPICard
                title={
                    <StyledTooltip content="Maximum acceptable slippage in basis points" placement="top">
                        <div className="flex items-center gap-1 cursor-help">
                            <span>Max Slippage</span>
                            <IconWrapper id={IconIds.INFORMATION} className="size-3 text-milk-400" />
                        </div>
                    </StyledTooltip>
                }
                content={
                    <div className="flex items-center gap-1">
                        <span>{slippage}</span>
                        <span className="text-milk-400 text-xs">bps</span>
                    </div>
                }
            />

            {/* Gas Budget */}
            <KPICard
                title="Daily Gas Budget"
                content={
                    gasSettings.daily_budget ? (
                        <div className="flex items-center gap-1">
                            <span>{numeral(gasSettings.daily_budget).format('0.0000')}</span>
                            <span className="text-milk-400 text-xs">ETH</span>
                        </div>
                    ) : (
                        <span className="text-milk-400">Not set</span>
                    )
                }
            />

            {/* Price Updates */}
            <KPICard title="Price Updates" content={numeral(instance.instance._count.Price).format('0,0')} />

            {/* Broadcast URL */}
            <KPICard title="Broadcast" content={<span className="truncate">{config?.broadcast_url || 'Unknown'}</span>} />

            {/* Price Feed */}
            <KPICard title="Price Feed" content={<span className="capitalize">{config?.price_feed_config?.type || 'Unknown'}</span>} />

            {/* Protocol Version */}
            <KPICard title="Protocol" content={config?.protocol_version || 'Unknown'} />
        </div>
    )
}

'use client'

import { useEffect } from 'react'
import { formatDistance } from 'date-fns'
import numeral from 'numeral'
import { cn } from '@/utils'
import { ChainImage, SymbolImage } from '@/components/common/ImageWrapper'
import IconWrapper from '@/components/icons/IconWrapper'
import { AppUrls, IconIds } from '@/enums'
import { useInstancesData } from '@/hooks/fetchs/useInstancesData'
import { usePricesData } from '@/hooks/fetchs/usePricesData'
import { EnrichedInstance } from '@/types'
import { SectionLayout } from '../sections/SectionLayout'
import { CHAINS_CONFIG } from '@/config/chains.config'
import LinkWrapper from '@/components/common/LinkWrapper'

export default function InstanceKPIs({ instance }: { instance: EnrichedInstance }) {
    const { refetch: refetchInstances } = useInstancesData()
    const { data: pricesData, refetch: refetchPrices } = usePricesData(instance.instance.id)
    // const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())

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
    // TODO: add price change 24h
    // const priceChange24h =
    //     pricesData && pricesData.length > 1
    //         ? ((latestPrice - pricesData[pricesData.length - 1].price) / pricesData[pricesData.length - 1].price) * 100
    //         : 0

    // Auto refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetchInstances()
            refetchPrices()
            // setLastUpdateTime(Date.now())
        }, 30000)

        return () => clearInterval(interval)
    }, [refetchInstances, refetchPrices])

    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {/* Status */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Status</p>
                    </div>
                }
                content={
                    <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', instance.instance.endedAt ? 'bg-red-500' : 'bg-green-500 animate-pulse')} />
                        <span className={cn('font-semibold', instance.instance.endedAt ? 'text-red-400' : 'text-green-400')}>
                            {instance.instance.endedAt ? 'Stopped' : 'Running'}
                        </span>
                    </div>
                }
            />

            {/* Running Time */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Running Time</p>
                    </div>
                }
                content={
                    <div className="flex items-center justify-between">
                        <span>{runningTime}</span>
                    </div>
                }
            />

            {/* Chain */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Chain</p>
                    </div>
                }
                content={
                    <div className="flex items-center gap-2">
                        <ChainImage id={instance.chainId} size={20} />
                        <p>{CHAINS_CONFIG[instance.chainId].name}</p>
                    </div>
                }
            />

            {/* Trading Pair */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Pair</p>
                    </div>
                }
                content={
                    <LinkWrapper
                        href={`${AppUrls.ORDERBOOK}/?chain=${CHAINS_CONFIG[instance.chainId].oneInchId}&sell=${instance.baseSymbol}&buy=${instance.quoteSymbol}`}
                        disabled={!instance.baseSymbol || !instance.quoteSymbol}
                        target="_blank"
                        className="flex items-center w-full gap-2"
                    >
                        <div className="flex items-center gap-2 hover:underline">
                            <SymbolImage symbol={instance.baseSymbol} size={20} />
                            <SymbolImage symbol={instance.quoteSymbol} size={20} className="-ml-3 rounded-full" />
                            <p>
                                {instance.baseSymbol}/{instance.quoteSymbol}
                            </p>
                        </div>
                        {instance.baseSymbol && instance.quoteSymbol && <IconWrapper id={IconIds.OPEN_LINK_IN_NEW_TAB} className="size-4" />}
                    </LinkWrapper>
                }
            />

            {/* Latest Price */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Latest Price</p>
                    </div>
                }
                content={
                    latestPrice > 0 ? (
                        <div className="flex items-center gap-1 text-sm text-milk-600">
                            <span>{numeral(latestPrice).format('0,0.0000')}</span>
                            <span className="text-milk-400 text-xs">{instance.quoteSymbol}</span>
                        </div>
                    ) : (
                        <div className="skeleton-loading h-6 w-24 rounded" />
                    )
                }
            />

            {/* Target Spread */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Target Spread</p>
                    </div>
                }
                content={<p>{targetSpread} bps</p>}
            />

            {/* Trade Count */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Total Trades</p>
                    </div>
                }
                content={
                    <div className="flex items-center justify-between">
                        <p>{numeral(instance.instance._count.Trade).format('0,0')}</p>
                    </div>
                }
            />

            {/* Slippage Tolerance */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Max Slippage</p>
                    </div>
                }
                content={<p>{slippage} bps</p>}
            />

            {/* Gas Budget */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Daily Gas Budget</p>
                    </div>
                }
                content={
                    gasSettings.daily_budget ? (
                        <div className="flex items-center gap-1">
                            <p>{numeral(gasSettings.daily_budget).format('0.0000')}</p>
                            <p>ETH</p>
                        </div>
                    ) : (
                        <p>Not set</p>
                    )
                }
            />

            {/* Price Updates */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Price Updates</p>
                    </div>
                }
                content={numeral(instance.instance._count.Price).format('0,0')}
            />

            {/* Broadcast URL */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Broadcast</p>
                    </div>
                }
                content={
                    config?.broadcast_url === 'buildernet' ? (
                        <LinkWrapper href={AppUrls.BUILDERNET} target="_blank" className="flex items-center w-full gap-2 hover:underline">
                            <p className="truncate capitalize">{config?.broadcast_url || 'Unknown'}</p>
                            <IconWrapper id={IconIds.OPEN_LINK_IN_NEW_TAB} className="size-4" />
                        </LinkWrapper>
                    ) : (
                        <p className="truncate capitalize">{config?.broadcast_url || 'Unknown'}</p>
                    )
                }
            />

            {/* Price Feed */}
            <SectionLayout
                title={
                    <div className="flex items-center gap-1 text-sm text-milk-600">
                        <p>Price Feed</p>
                    </div>
                }
                content={<p className="capitalize">{config?.price_feed_config?.type || 'Unknown'}</p>}
            />
        </div>
    )
}

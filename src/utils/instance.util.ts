import { CHAINS_CONFIG } from '@/config/chains.config'
import { getTokenByAddress } from '@/config/tokens.config'
import { SupportedFilters, SupportedFilterDirections } from '@/enums'
import { UnstableConfigurationValues } from '@/interfaces'
import type { ConfigurationWithInstances, InstanceWithCounts } from '@/types'
import { Configuration } from '@prisma/client'

export const sortInstances = (
    configurations: ConfigurationWithInstances[],
    sortBy: SupportedFilters,
    direction: SupportedFilterDirections,
): ConfigurationWithInstances[] => {
    // Flatten all instances with their config
    const allInstances = configurations.flatMap((config) => config.Instance.map((instance) => ({ config, instance })))

    // Sort based on the selected filter
    const sortedInstances = allInstances.sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
            case SupportedFilters.CONFIGURATION_CREATED:
                comparison = new Date(a.config.createdAt).getTime() - new Date(b.config.createdAt).getTime()
                break
            case SupportedFilters.INSTANCE_STARTED:
                comparison =
                    (a.instance.startedAt ? new Date(a.instance.startedAt).getTime() : 0) -
                    (b.instance.startedAt ? new Date(b.instance.startedAt).getTime() : 0)
                break
            case SupportedFilters.RUNNING_TIME:
                const aRunningTime = a.instance.startedAt
                    ? (a.instance.endedAt ? new Date(a.instance.endedAt).getTime() : Date.now()) - new Date(a.instance.startedAt).getTime()
                    : 0
                const bRunningTime = b.instance.startedAt
                    ? (b.instance.endedAt ? new Date(b.instance.endedAt).getTime() : Date.now()) - new Date(b.instance.startedAt).getTime()
                    : 0
                comparison = aRunningTime - bRunningTime
                break
            case SupportedFilters.INSTANCE_ENDED:
                comparison =
                    (a.instance.endedAt ? new Date(a.instance.endedAt).getTime() : 0) -
                    (b.instance.endedAt ? new Date(b.instance.endedAt).getTime() : 0)
                break
            case SupportedFilters.TRADE_COUNT:
                comparison = a.instance._count.Trade - b.instance._count.Trade
                break
            case SupportedFilters.PRICES_COUNT_CALLED:
                comparison = a.instance._count.Price - b.instance._count.Price
                break
            default:
                comparison = 0
        }

        return direction === SupportedFilterDirections.ASCENDING ? comparison : -comparison
    })

    // Rebuild the configurations structure
    const configMap = new Map<string, ConfigurationWithInstances>()

    sortedInstances.forEach(({ config, instance }) => {
        const configId = config.id
        if (!configMap.has(configId)) {
            configMap.set(configId, {
                ...config,
                Instance: [],
            })
        }
        configMap.get(configId)!.Instance.push(instance)
    })

    return Array.from(configMap.values())
}

export const enrichInstanceWithConfig = (instance: InstanceWithCounts, config: Configuration) => {
    const base = getTokenByAddress(config.chainId, config.baseTokenAddress)
    const quote = getTokenByAddress(config.chainId, config.quoteTokenAddress)

    return {
        // meta
        config: config as Configuration & { values: UnstableConfigurationValues },
        instance,

        // enricheds
        chain: CHAINS_CONFIG[config.chainId],
        base,
        quote,

        // filters
        chainId: config.chainId,
        baseSymbol: base?.symbol ?? '',
        quoteSymbol: quote?.symbol ?? '',
    }
}

import { ConfigurationWithInstances, Strategy, InstanceWithCounts } from '@/types'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { UnstableInstanceConfigValues, TokenConfig } from '@/interfaces'
import { getTokenByAddress } from '@/config/tokens.config'
import { jsonConfigParser } from './parser'
import { Trade } from '@prisma/client'
import { AppSupportedChainIds } from '@/enums'

export const getStrategyPair = (strategy: Strategy): string => {
    return `${strategy.base.symbol}-${strategy.quote.symbol}`.toLowerCase()
}

const createStrategy = (
    chainId: AppSupportedChainIds,
    baseToken: TokenConfig,
    quoteToken: TokenConfig,
    configValues: UnstableInstanceConfigValues,
    configId: string,
): Strategy => ({
    chainId,
    base: baseToken,
    quote: quoteToken,
    instances: [],
    pnlUsd: 0,
    aumUsd: 0,
    priceUsd: 0,
    tradesCount: 0,
    config: jsonConfigParser(configId, configValues),
})

const findOrCreateStrategy = (
    strategies: Strategy[],
    chainId: AppSupportedChainIds,
    baseToken: TokenConfig,
    quoteToken: TokenConfig,
    configValues: UnstableInstanceConfigValues,
    configId: string,
): number => {
    const index = strategies.findIndex((s) => s.chainId === chainId)
    if (index >= 0) return index

    strategies.push(createStrategy(chainId, baseToken, quoteToken, configValues, configId))
    return strategies.length - 1
}

const addInstanceToStrategy = (strategy: Strategy, instance: InstanceWithCounts): void => {
    const exists = strategy.instances.some((i) => i.value.id === instance.id)
    if (!exists) {
        strategy.instances.push({
            value: {
                ...instance,
                trades: instance.Trade || [],
            },
        })
    }
}

export const groupByStrategies = (configurations: ConfigurationWithInstances[]): Strategy[] => {
    const strategies: Strategy[] = []

    for (const configuration of configurations) {
        const chain = CHAINS_CONFIG[configuration.chainId]
        if (!chain) continue

        for (const instance of configuration.Instance) {
            const configValues = configuration.values as unknown as UnstableInstanceConfigValues

            const baseToken = getTokenByAddress(chain.id, configValues.base_token_address)
            const quoteToken = getTokenByAddress(chain.id, configValues.quote_token_address)
            if (!baseToken || !quoteToken) continue

            const strategyIndex = findOrCreateStrategy(strategies, chain.id, baseToken, quoteToken, configValues, configuration.id)
            addInstanceToStrategy(strategies[strategyIndex], instance)
        }
    }

    return strategies
}

export const listTrades = (strategy: Strategy): Trade[] => {
    const trades: Trade[] = []

    for (const instance of strategy.instances) {
        trades.push(...instance.value.trades)
    }

    return trades
}

export const listTradesByChain = (chain: Strategy): Trade[] => {
    const trades: Trade[] = []

    for (const instance of chain.instances) {
        trades.push(...instance.value.trades)
    }

    return trades
}

import { ConfigurationWithInstances, Strategy, InstanceWithCounts } from '@/types'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { UnstableInstanceConfigValues, TokenConfig, ChainConfig } from '@/interfaces'
import { AppSupportedChainIds } from '@/enums'
import { getTokenByAddress } from '@/config/tokens.config'
import { jsonConfigParser } from './parser'
import { Trade, Configuration } from '@prisma/client'

const createStrategy = (pair: string, baseToken: TokenConfig, quoteToken: TokenConfig, configValues: UnstableInstanceConfigValues): Strategy => ({
    pair,
    base: baseToken,
    quote: quoteToken,
    chains: [],
    instancesCount: 0,
    tradesCount: 0,
    pnl: 0,
    config: jsonConfigParser(configValues),
})

const findOrCreateStrategy = (
    strategies: Strategy[],
    pair: string,
    baseToken: TokenConfig,
    quoteToken: TokenConfig,
    configValues: UnstableInstanceConfigValues,
): number => {
    const index = strategies.findIndex((s) => s.pair === pair)
    if (index >= 0) return index

    strategies.push(createStrategy(pair, baseToken, quoteToken, configValues))
    return strategies.length - 1
}

const findOrCreateChain = (strategy: Strategy, chainId: AppSupportedChainIds, chainValue: ChainConfig): number => {
    const index = strategy.chains.findIndex((c) => c.value.id === chainId)
    if (index >= 0) return index

    strategy.chains.push({ value: chainValue, configurations: [] })
    return strategy.chains.length - 1
}

const findOrCreateConfiguration = (chain: Strategy['chains'][number], configId: string, configuration: Configuration): number => {
    const index = chain.configurations.findIndex((c) => c.value.id === configId)
    if (index >= 0) return index

    chain.configurations.push({
        value: configuration,
        instances: [],
        parsedConfiguration: jsonConfigParser(configuration.values),
    })
    return chain.configurations.length - 1
}

const addInstanceToConfiguration = (configuration: Strategy['chains'][number]['configurations'][number], instance: InstanceWithCounts): void => {
    const exists = configuration.instances.some((i) => i.value.id === instance.id)
    if (!exists) {
        configuration.instances.push({
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
            const pair = `${configValues.base_token}-${configValues.quote_token}`

            const baseToken = getTokenByAddress(chain.id, configValues.base_token_address)
            const quoteToken = getTokenByAddress(chain.id, configValues.quote_token_address)
            if (!baseToken || !quoteToken) continue

            const strategyIndex = findOrCreateStrategy(strategies, pair, baseToken, quoteToken, configValues)
            const chainIndex = findOrCreateChain(strategies[strategyIndex], chain.id, chain)
            const configIndex = findOrCreateConfiguration(strategies[strategyIndex].chains[chainIndex], configuration.id, configuration)

            addInstanceToConfiguration(strategies[strategyIndex].chains[chainIndex].configurations[configIndex], instance)

            strategies[strategyIndex].instancesCount += 1
            strategies[strategyIndex].tradesCount += instance.Trade?.length || 0
        }
    }

    return strategies
}

export const listTrades = (strategy: Strategy): Trade[] => {
    const trades: Trade[] = []

    for (const chain of strategy.chains) {
        for (const configuration of chain.configurations) {
            for (const instance of configuration.instances) {
                trades.push(...instance.value.trades)
            }
        }
    }

    return trades
}

export const listTradesByChain = (chain: Strategy['chains'][number]): Trade[] => {
    const trades: Trade[] = []

    for (const configuration of chain.configurations) {
        for (const instance of configuration.instances) {
            trades.push(...instance.value.trades)
        }
    }

    return trades
}

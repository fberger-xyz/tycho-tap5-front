import { ConfigurationWithInstances, Strategy } from '@/types'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { UnstableInstanceConfigValues } from '@/interfaces'
import { getTokenByAddress } from '@/config/tokens.config'
import { jsonConfigParser } from './parser'
import { Trade } from '@prisma/client'

export const groupByStrategies = (configurations: ConfigurationWithInstances[]): Strategy[] => {
    const strategies: Strategy[] = []

    // for each configuration
    for (const configuration of configurations) {
        // get chain
        const chain = CHAINS_CONFIG[configuration.chainId]

        // for each instance
        for (const instance of configuration.Instance) {
            // parse config values
            const configValues = configuration.values as unknown as UnstableInstanceConfigValues

            // get pair
            const currPair = `${configValues.base_token}-${configValues.quote_token}`

            // 1. upsert strategy
            let strategyIndex = strategies.findIndex((currStrategy) => currStrategy.pair === currPair)

            const baseToken = getTokenByAddress(chain.id, configValues.base_token_address)
            if (!baseToken) continue
            const quoteToken = getTokenByAddress(chain.id, configValues.quote_token_address)
            if (!quoteToken) continue

            // if strategy not found, create it
            if (strategyIndex < 0) {
                strategies.push({
                    pair: currPair,
                    base: baseToken,
                    quote: quoteToken,
                    chains: [],
                    instancesCount: 0,
                    tradesCount: 0,
                    pnl: 0,
                    config: jsonConfigParser(configValues),
                })
                strategyIndex = strategies.length - 1
            }

            // 2. upsert chain
            let chainIndex = strategies[strategyIndex].chains.findIndex((currChain) => currChain.value.id === chain.id)
            if (chainIndex < 0) {
                strategies[strategyIndex].chains.push({ value: chain, configurations: [] })
                chainIndex = strategies[strategyIndex].chains.length - 1
            }

            // 3. upsert configuration
            let configIndex = strategies[strategyIndex].chains[chainIndex].configurations.findIndex(
                (currConfig) => currConfig.value.id === configuration.id,
            )
            if (configIndex < 0) {
                strategies[strategyIndex].chains[chainIndex].configurations.push({
                    value: configuration,
                    instances: [],
                    parsedConfiguration: jsonConfigParser(configuration.values),
                })
                configIndex = strategies[strategyIndex].chains[chainIndex].configurations.length - 1
            }

            // 4. upsert instance
            let instanceIndex = strategies[strategyIndex].chains[chainIndex].configurations[configIndex].instances.findIndex(
                (currInstance) => currInstance.value.id === instance.id,
            )
            if (instanceIndex < 0) {
                strategies[strategyIndex].chains[chainIndex].configurations[configIndex].instances.push({
                    value: {
                        ...instance,
                        trades: instance.Trade || [],
                    },
                })
                instanceIndex = strategies[strategyIndex].chains[chainIndex].configurations[configIndex].instances.length - 1
            }

            // increment
            strategies[strategyIndex].instancesCount += 1
            strategies[strategyIndex].tradesCount += instance.Trade?.length || 0
            // todo: strategies[strategyIndex].pnl += instance.Trade?.reduce((acc, curr) => acc + curr.pnl, 0) || 0
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

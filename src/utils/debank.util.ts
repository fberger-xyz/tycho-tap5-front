import type { ConfigurationWithInstances, Strategy } from '@/types'
import { jsonConfigParser } from './data/parser'

interface WalletChainPair {
    walletAddress: string
    chainId: number
}

interface DebankResult {
    walletAddress: string
    chainId: number
    networth: number
}

/**
 * Extract unique wallet/chain combinations from configurations
 */
export function extractUniqueWalletChains(configurations: ConfigurationWithInstances[]): WalletChainPair[] {
    const uniquePairs = new Map<string, WalletChainPair>()

    configurations.forEach((config) => {
        const chainId = config.chainId

        config.Instance.forEach(() => {
            // Parse the configuration to get wallet address
            try {
                const parsedConfig = jsonConfigParser(config.values)
                const walletAddress = parsedConfig.inventory.walletPublicKey

                if (walletAddress && chainId) {
                    // Use combination of wallet and chain as key to ensure uniqueness
                    const key = `${walletAddress.toLowerCase()}-${chainId}`
                    if (!uniquePairs.has(key)) {
                        uniquePairs.set(key, {
                            walletAddress,
                            chainId,
                        })
                    }
                }
            } catch (error) {
                console.error('Error parsing configuration:', error)
            }
        })
    })

    return Array.from(uniquePairs.values())
}

/**
 * Enrich strategies with AUM data from Debank
 */
export function enrichStrategiesWithAUM(strategies: Strategy[], debankResults: DebankResult[]): Strategy[] {
    // Create a map for quick lookup of Debank data
    const debankMap = new Map<string, number>()
    debankResults.forEach((result) => {
        const key = `${result.walletAddress.toLowerCase()}-${result.chainId}`
        debankMap.set(key, result.networth)
    })

    return strategies.map((strategy) => {
        let totalAUM = 0

        // Sum up AUM for all instances in this strategy
        strategy.instances.forEach((instance) => {
            try {
                // Get wallet address from instance config
                const instanceConfig = instance.value.config as { wallet_public_key?: string }
                const walletAddress = instanceConfig?.wallet_public_key

                if (walletAddress && strategy.chainId) {
                    const key = `${walletAddress.toLowerCase()}-${strategy.chainId}`
                    const networth = debankMap.get(key) || 0
                    totalAUM += networth
                }
            } catch (error) {
                console.error('Error processing instance AUM:', error)
            }
        })

        return {
            ...strategy,
            aumUsd: totalAUM,
        }
    })
}

/**
 * Calculate total AUM across all strategies
 */
export function calculateTotalAUM(strategies: Strategy[]): number {
    return strategies.reduce((total, strategy) => total + (strategy.aumUsd || 0), 0)
}

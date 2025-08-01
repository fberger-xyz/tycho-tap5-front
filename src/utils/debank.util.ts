import type { ConfigurationWithInstances } from '@/types'
import { jsonConfigParser } from './data/parser'

export interface WalletChainPair {
    walletAddress: string
    chainId: number
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
                const parsedConfig = jsonConfigParser(config.id, config.values)
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

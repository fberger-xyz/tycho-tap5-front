import { env } from '@/env/t3-env'

// Server-side only configuration for RPC URLs
// This file should never be imported on the client side

// Helper functions for RPC URLs
const createInfuraUrls = (network: string): string[] => {
    const keys = [env.INFURA_API_KEY].filter(Boolean)
    return keys.map((key) => `https://${network}.infura.io/v3/${key}`)
}

const createAlchemyUrls = (network: string): string[] => {
    const keys = [env.ALCHEMY_API_KEY].filter(Boolean)
    return keys.map((key) => `https://${network}.g.alchemy.com/v2/${key}`)
}

export const CHAIN_RPC_URLS: Record<number, string[]> = {
    1: [...createInfuraUrls('mainnet'), ...createAlchemyUrls('eth-mainnet')], // Ethereum
    130: [], // Unichain - Infura/Alchemy don't support it yet, will use public endpoints
}

export function getRpcUrlsForChain(chainId: number): string[] {
    const urls = CHAIN_RPC_URLS[chainId] || []

    // If no RPC URLs are configured, use public endpoints as fallback
    if (urls.length === 0) {
        if (chainId === 1) {
            // Ethereum mainnet public endpoints
            return ['https://eth.llamarpc.com', 'https://rpc.ankr.com/eth', 'https://cloudflare-eth.com']
        } else if (chainId === 130) {
            // Unichain public endpoints
            return ['https://unichain-rpc.publicnode.com', 'https://unichain.api.onfinality.io/public']
        }
    }

    return urls
}

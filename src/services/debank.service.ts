import { CHAINS_CONFIG } from '@/config/chains.config'
import { env } from '@/env/t3-env'
import { fetchWithTimeout } from '@/utils/requests.util'
import { DebankUserNetWorthUsd, DebankUserNetWorthUsdSnapshot, DebankToken } from '@/interfaces/debank.interface'

const DEBANK_API_BASE = 'https://pro-openapi.debank.com/v1'
const DEFAULT_TIMEOUT = 60000
const DEFAULT_RETRIES = 1

/**
 * Service for interacting with Debank API
 */
export class DebankService {
    private static getHeaders() {
        return {
            'Content-Type': 'application/json',
            AccessKey: String(env.DEBANK_ACCESS_KEY),
        }
    }

    /**
     * Validate if chain is supported by Debank
     */
    static validateChain(chainId: number): string {
        const chainConfig = CHAINS_CONFIG[chainId]
        if (!chainConfig || !chainConfig.debankId) {
            throw new Error(`Chain ${chainId} not supported by Debank`)
        }
        return chainConfig.debankId
    }

    /**
     * Fetch user's net worth on a specific chain
     */
    static async fetchNetWorth(walletAddress: string, debankChainId: string): Promise<DebankUserNetWorthUsd> {
        const url = `${DEBANK_API_BASE}/user/chain_balance?id=${walletAddress}&chain_id=${debankChainId}`
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: this.getHeaders(),
            timeout: DEFAULT_TIMEOUT,
            retries: DEFAULT_RETRIES,
        })
        return (await response.json()) as DebankUserNetWorthUsd
    }

    /**
     * Fetch user's 24-hour net worth curve on a specific chain
     */
    static async fetchNetWorthCurve(walletAddress: string, debankChainId: string): Promise<DebankUserNetWorthUsdSnapshot[]> {
        const url = `${DEBANK_API_BASE}/user/chain_net_curve?id=${walletAddress}&chain_id=${debankChainId}`
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: this.getHeaders(),
            timeout: DEFAULT_TIMEOUT,
            retries: DEFAULT_RETRIES,
        })
        return (await response.json()) as DebankUserNetWorthUsdSnapshot[]
    }

    /**
     * Fetch both net worth and 24h curve data
     */
    static async fetchWalletData(walletAddress: string, chainId: number) {
        const debankChainId = this.validateChain(chainId)

        const result = {
            networth: { usd_value: 0 } as DebankUserNetWorthUsd,
            debankLast24hNetWorth: [] as DebankUserNetWorthUsdSnapshot[],
        }

        // Fetch net worth
        result.networth = await this.fetchNetWorth(walletAddress, debankChainId)

        // Fetch 24-hour net curve (don't fail if this errors)
        try {
            result.debankLast24hNetWorth = await this.fetchNetWorthCurve(walletAddress, debankChainId)
        } catch (error) {
            console.warn('Failed to fetch 24h net worth data:', error)
        }

        return result
    }

    /**
     * Fetch user's token list on a specific chain
     */
    static async fetchTokenList(walletAddress: string, debankChainId: string, isAll: boolean = true): Promise<DebankToken[]> {
        const url = `${DEBANK_API_BASE}/user/token_list?id=${walletAddress}&chain_id=${debankChainId}&is_all=${isAll}`
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: this.getHeaders(),
            timeout: DEFAULT_TIMEOUT,
            retries: DEFAULT_RETRIES,
        })
        return (await response.json()) as DebankToken[]
    }
}

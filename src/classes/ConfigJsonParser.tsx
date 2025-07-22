import { CHAINS_CONFIG } from '@/config/chains.config'
import { getTokenByAddress } from '@/config/tokens.config'
import { ParsedConfigurationValues, UnstableInstanceConfigValues } from '@/interfaces'

export class ConfigJsonParser {
    private config: UnstableInstanceConfigValues

    constructor(config: unknown) {
        this.config = config as UnstableInstanceConfigValues
    }

    parse(): ParsedConfigurationValues {
        return {
            // base
            base: {
                symbol: this.config.base_token,
                address: this.config.base_token_address,
                config: getTokenByAddress(this.config.chain_id, this.config.base_token),
            },

            // quote
            quote: {
                symbol: this.config.quote_token,
                address: this.config.quote_token_address,
                config: getTokenByAddress(this.config.chain_id, this.config.quote_token),
            },

            // chain
            chain: {
                id: this.config.chain_id,
                name: this.config.network_name,
                chainId: this.config.chain_id,
                networkName: this.config.network_name,
                config: CHAINS_CONFIG[this.config.chain_id] ?? null,

                // example: 3500$ for ETH
                gas: {
                    symbol: this.config.gas_token_symbol,
                    chainlinkPriceFeed: this.config.gas_token_chainlink_price_feed, // can be null > coingecko > ...
                },

                // useless
                rpcUrl: this.config.rpc_url,
                explorerUrl: this.config.explorer_url,
            },

            // tycho
            tycho: {
                tychoRouterAddress: this.config.tycho_router_address,
                tychoApi: this.config.tycho_api,
                // infiniteApproval: this.config.infinite_approval, // TODO: add this
                permit2Address: this.config.permit2_address,
            },

            // price / exec
            execution: {
                txGasLimit: this.config.tx_gas_limit,
                targetSpreadBps: this.config.target_spread_bps,
                maxSlippagePct: this.config.max_slippage_pct,
                priceFeedConfig: this.config.price_feed_config,
                minExecSpreadBps: this.config.min_exec_spread_bps,
                profitabilityCheck: this.config.profitability_check,
                pollIntervalMs: this.config.poll_interval_ms,
                gasTokenSymbol: this.config.gas_token_symbol,
                broadcastUrl: this.config.broadcast_url,
                blockOffset: this.config.block_offset,
                // quoteDepth: this.config.quote_depths, // useless
            },

            // inventory
            inventory: {
                walletPublicKey: this.config.wallet_public_key,
                maxInventoryRatio: this.config.max_inventory_ratio, // float max allocation per trade
            },
        }
    }
}

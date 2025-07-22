import { CHAINS_CONFIG } from '@/config/chains.config'
import { getTokenByAddress } from '@/config/tokens.config'
import { ParsedConfigurationValues, UnstableInstanceConfigValues } from '@/interfaces'

export const jsonConfigParser = (json: unknown): ParsedConfigurationValues => {
    const castedJson = json as UnstableInstanceConfigValues
    return {
        // base
        base: {
            symbol: castedJson.base_token,
            address: castedJson.base_token_address,
            config: getTokenByAddress(castedJson.chain_id, castedJson.base_token),
        },

        // quote
        quote: {
            symbol: castedJson.quote_token,
            address: castedJson.quote_token_address,
            config: getTokenByAddress(castedJson.chain_id, castedJson.quote_token),
        },

        // chain
        chain: {
            id: castedJson.chain_id,
            name: castedJson.network_name,
            chainId: castedJson.chain_id,
            networkName: castedJson.network_name,
            config: CHAINS_CONFIG[castedJson.chain_id] ?? null,

            // example: 3500$ for ETH
            gas: {
                symbol: castedJson.gas_token_symbol,
                chainlinkPriceFeed: castedJson.gas_token_chainlink_price_feed, // can be null > coingecko > ...
            },

            // useless
            rpcUrl: castedJson.rpc_url,
            explorerUrl: castedJson.explorer_url,
        },

        // tycho
        tycho: {
            tychoRouterAddress: castedJson.tycho_router_address,
            tychoApi: castedJson.tycho_api,
            // infiniteApproval: castedJson.infinite_approval, // TODO: add this
            permit2Address: castedJson.permit2_address,
        },

        // price / exec
        execution: {
            txGasLimit: castedJson.tx_gas_limit,
            targetSpreadBps: castedJson.target_spread_bps,
            maxSlippagePct: castedJson.max_slippage_pct,
            priceFeedConfig: castedJson.price_feed_config,
            minExecSpreadBps: castedJson.min_exec_spread_bps,
            profitabilityCheck: castedJson.profitability_check,
            pollIntervalMs: castedJson.poll_interval_ms,
            gasTokenSymbol: castedJson.gas_token_symbol,
            broadcastUrl: castedJson.broadcast_url,
            blockOffset: castedJson.block_offset,
            // quoteDepth: castedJson.quote_depths, // useless
        },

        // inventory
        inventory: {
            walletPublicKey: castedJson.wallet_public_key,
            maxInventoryRatio: castedJson.max_inventory_ratio, // float max allocation per trade
        },
    }
}

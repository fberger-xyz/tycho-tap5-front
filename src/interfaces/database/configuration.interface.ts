import { ChainConfig, TokenConfig } from '../app.interface'

export interface UnstableInstanceConfigValues {
    rpc_url: string
    chain_id: number
    pair_tag: string
    tycho_api: string
    base_token: string
    quote_token: string
    block_offset: number
    explorer_url: string
    network_name: string
    tx_gas_limit: number
    publish_events: boolean
    permit2_address: string
    skip_simulation: boolean
    gas_token_symbol: string
    max_slippage_pct: number
    poll_interval_ms: number
    infinite_approval: boolean
    price_feed_config: {
        type: string
        source: string
        reverse: boolean
    }
    wallet_public_key: string
    base_token_address: string
    max_inventory_ratio: number
    min_exec_spread_bps: number
    quote_token_address: string
    tycho_router_address: string
    inclusion_block_delay: number
    min_publish_timeframe_ms: number
    min_spread_threshold_bps: number
    gas_token_chainlink_price_feed: string
}

export interface ParsedConfigurationValues {
    base: {
        symbol: string
        address: string
        config: TokenConfig | null
    }
    quote: {
        symbol: string
        address: string
        config: TokenConfig | null
    }
    chain: {
        id: number
        name: string
        chainId: number
        networkName: string
        config: ChainConfig
        gas: {
            symbol: string
            chainlinkPriceFeed: string
        }
        rpcUrl: string
        explorerUrl: string
    }
    tycho: {
        tychoRouterAddress: string
        tychoApi: string
        permit2Address: string
    }
    execution: {
        txGasLimit: number
        // targetSpreadBps: number // v1
        minSpreadThresholdBps: number
        maxSlippagePct: number
        priceFeedConfig: {
            type: string
            source: string
            reverse: boolean
        }
        minExecSpreadBps: number
        // profitabilityCheck: boolean // v1
        pollIntervalMs: number
        gasTokenSymbol: string
        // broadcastUrl: string // v1
        blockOffset: number
    }
    inventory: {
        walletPublicKey: string
        maxInventoryRatio: number
    }
}

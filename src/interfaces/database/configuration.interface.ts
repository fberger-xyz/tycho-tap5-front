import { ChainConfig, TokenConfig } from '../app.interface'

export interface UnstableInstanceConfigValues {
    rpc_url: string
    chain_id: number
    pair_tag: string
    tycho_api: string
    infinite_approval: boolean
    base_token: string
    quote_token: string
    block_offset: number
    explorer_url: string
    network_name: string
    quote_depths: number[]
    tx_gas_limit: number
    broadcast_url: string
    permit2_address: string
    gas_token_symbol: string
    max_slippage_pct: number
    poll_interval_ms: number
    price_feed_config: {
        type: string
        source: string
        reverse: boolean
    }
    target_spread_bps: number
    wallet_public_key: string
    base_token_address: string
    max_inventory_ratio: number
    min_exec_spread_bps: number
    profitability_check: boolean
    quote_token_address: string
    tycho_router_address: string
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
        targetSpreadBps: number
        maxSlippagePct: number
        priceFeedConfig: {
            type: string
            source: string
            reverse: boolean
        }
        minExecSpreadBps: number
        profitabilityCheck: boolean
        pollIntervalMs: number
        gasTokenSymbol: string
        broadcastUrl: string
        blockOffset: number
    }
    inventory: {
        walletPublicKey: string
        maxInventoryRatio: number
    }
}

import { TradeStatus } from '@/enums'

/**
 * ----------- v1
 */

export interface ApiTrade {
    id: string
    instanceId: string
    tokenInSymbol: string
    tokenInAmount: string
    tokenInValueUsd?: number
    tokenOutSymbol: string
    tokenOutAmount: string
    tokenOutValueUsd?: number
    protocol?: string
    poolAddress: string
    poolFee?: number
    status?: TradeStatus
    gasCost?: string
    gasCostUsd?: number
    netProfit?: number | null
    netProfitUsd?: number
    createdAt: string | Date
    transactionHash?: string
    Instance?: {
        chain: string
    }
}

export interface TradeData {
    id: string
    instanceId: string
    chain: string
    chainName?: string
    tokenIn: {
        symbol: string
        amount: string
        valueUsd?: number
    }
    tokenOut: {
        symbol: string
        amount: string
        valueUsd?: number
    }
    pool: {
        protocol: string
        address: string
        fee?: number
    }
    status: TradeStatus
    gasCost?: {
        amount: string
        valueUsd?: number
    }
    netProfit?: {
        amount: string
        valueUsd?: number
    }
    timestamp: Date | string
    txHash?: string
}

export interface FormattedTrade extends TradeData {
    formattedTimestamp: string
    formattedTimeAgo: string
}

export interface TradeValuesV1 {
    block: number
    payload: {
        swap: {
            hash: string
            sent: boolean
            error: null
            status: boolean
            receipt: {
                to: string
                from: string
                logs: unknown[]
                type: string
                status: string
                gasUsed: string
                blockHash: string
                logsBloom: string
                blockNumber: string
                contractAddress: null
                transactionHash: string
                transactionIndex: string
                cumulativeGasUsed: string
                effectiveGasPrice: string
            }
        }
        approval: {
            hash: string
            sent: boolean
            error: null
            status: boolean
            receipt: {
                to: string
                from: string
                logs: {
                    data: string
                    topics: string[]
                    address: string
                    removed: boolean
                    logIndex: string
                    blockHash: string
                    blockNumber: string
                    transactionHash: string
                    transactionIndex: string
                }[]
                type: string
                status: string
                gasUsed: string
                blockHash: string
                logsBloom: string
                blockNumber: string
                contractAddress: null
                transactionHash: string
                transactionIndex: string
                cumulativeGasUsed: string
                effectiveGasPrice: string
            }
        }
    }
    identifier: string
    trade_data: null
}

/**
 * ----------- v2
 */

export interface TradeValuesV2 {
    data: {
        status: string
        context: {
            block: number
            eth_to_usd: number
            base_to_eth: number
            quote_to_eth: number
            max_fee_per_gas: number
            native_gas_price: number
            max_priority_fee_per_gas: number
        }
        metadata: {
            base_token: string
            spot_price: number
            quote_token: string
            gas_cost_usd: number
            reference_price: number
            trade_direction: string
            profit_delta_bps: number
            amount_out_expected: number
            amount_in_normalized: number
            slippage_tolerance_bps: number
        }
        broadcast: {
            hash: string
            receipt: {
                error: null
                status: boolean
                gas_used: number
                block_number: number
                transaction_hash: string
                transaction_index: number
                effective_gas_price: number
            }
            broadcast_error: null
            broadcasted_at_ms: number
            broadcasted_took_ms: number
        }

        inventory: {
            nonce: number
            base_balance: number
            quote_balance: number
        }

        timestamp: number
        simulation: {
            error: null
            status: boolean
            estimated_gas: number
            simulated_at_ms: number
            simulated_took_ms: number
        }
    }
    identifier: string
}

/**
 * todo
 * only use latest version in codebase
 */

export type TradeValues = TradeValuesV2

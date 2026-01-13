/**
 * ------------ v1
 */

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

// Base interfaces for common structures
interface TradeContext {
    block: number
    eth_to_usd: number
    base_to_eth: number
    quote_to_eth: number
    max_fee_per_gas: number
    native_gas_price: number
    max_priority_fee_per_gas: number
}

interface TradeMetadata {
    pool: string
    base_token: string
    spot_price: number
    quote_token: string
    gas_cost_usd: number
    reference_price: number
    trade_direction: 'Buy' | 'Sell'
    profit_delta_bps: number
    amount_out_expected: number
    amount_in_normalized: number
    slippage_tolerance_bps: number
}

interface TradeInventory {
    nonce: number
    base_balance: number
    quote_balance: number
}

// Success trade with successful broadcast
export interface TradeValuesSuccess {
    data: {
        status: 'BroadcastSucceeded'
        context: TradeContext
        metadata: TradeMetadata
        broadcast: {
            hash: string
            receipt: {
                error: null
                status: true
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
        inventory: TradeInventory
        timestamp: number
        simulation: {
            error: null
            status: true
            estimated_gas: number
            simulated_at_ms: number
            simulated_took_ms: number
        }
    }
    identifier: string
}

// Reverted trade (broadcast succeeded but transaction reverted)
export interface TradeValuesReverted {
    data: {
        status: 'BroadcastSucceeded'
        context: TradeContext
        metadata: TradeMetadata
        broadcast: {
            hash: string
            receipt: {
                error: null
                status: false // Transaction reverted
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
        inventory: TradeInventory
        timestamp: number
        simulation: {
            error: null
            status: true
            estimated_gas: number
            simulated_at_ms: number
            simulated_took_ms: number
        }
    }
    identifier: string
}

// Simulation failed trade
export interface TradeValuesSimulationFailed {
    data: {
        status: 'SimulationFailed'
        context: TradeContext
        metadata: TradeMetadata
        broadcast: null // No broadcast when simulation fails
        inventory: TradeInventory
        timestamp: number
        simulation: {
            error: string
            status: false
            estimated_gas: number
            simulated_at_ms: number
            simulated_took_ms: number
        }
    }
    identifier: string
}

// Union type for all trade types
export type TradeValuesV2 = TradeValuesSuccess | TradeValuesReverted | TradeValuesSimulationFailed

// Type guards with defensive null checks
export function isSuccessfulTrade(trade: TradeValuesV2): trade is TradeValuesSuccess {
    return (
        trade.data.status === 'BroadcastSucceeded' &&
        trade.data.broadcast !== null &&
        trade.data.broadcast?.receipt?.status === true
    )
}

export function isRevertedTrade(trade: TradeValuesV2): trade is TradeValuesReverted {
    return (
        trade.data.status === 'BroadcastSucceeded' &&
        trade.data.broadcast !== null &&
        trade.data.broadcast?.receipt?.status === false
    )
}

export function isSimulationFailedTrade(trade: TradeValuesV2): trade is TradeValuesSimulationFailed {
    return trade.data.status === 'SimulationFailed'
}

export type TradeValues = TradeValuesV2

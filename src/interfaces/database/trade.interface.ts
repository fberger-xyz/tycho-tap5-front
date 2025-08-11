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
            pool: string
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

// {
//     "data": {
//         "status": "BroadcastSucceeded",
//         "context": {
//             "block": 22797954,
//             "eth_to_usd": 3732.51,
//             "base_to_eth": 1,
//             "quote_to_eth": 0.0002685301588694327,
//             "max_fee_per_gas": 726,
//             "native_gas_price": 1000362,
//             "max_priority_fee_per_gas": 2
//         },
//         "metadata": {
//             "pool": "0x65081cb48d74a32e9ccfed75164b8c09972dbcf1",
//             "base_token": "USDC",
//             "spot_price": 3723.9764956390973,
//             "quote_token": "WETH",
//             "gas_cost_usd": 0.00049286967425784,
//             "reference_price": 3726.29,
//             "trade_direction": "Sell",
//             "profit_delta_bps": 1.0093219340561008,
//             "amount_out_expected": 0.013453168960294987,
//             "amount_in_normalized": 50.099285,
//             "slippage_tolerance_bps": 5
//         },
//         "broadcast": {
//             "hash": "0x24d2bc126cb46106a46ba75d4b0555b53e7e65f7132e0b26036c4b761cab3684",
//             "receipt": null,
//             "broadcast_error": null,
//             "broadcasted_at_ms": 0,
//             "broadcasted_took_ms": 293
//         },
//         "inventory": {
//             "nonce": 2377,
//             "base_balance": 34372499573223500,
//             "quote_balance": 100198570
//         },
//         "timestamp": 0,
//         "simulation": {
//             "error": null,
//             "status": true,
//             "estimated_gas": 172253,
//             "simulated_at_ms": 0,
//             "simulated_took_ms": 106
//         }
//     },
//     "identifier": "mmc-unichain-eth-usdc-0xf5029a5-instance-1753546206"
// }

/**
 * todo
 * only use latest version in codebase
 */

export type TradeValues = TradeValuesV2

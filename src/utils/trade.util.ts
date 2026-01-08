// import { TradeValuesV2 } from '@/interfaces'
// import { TradeStatus } from '@/enums'
// import { TradeWithInstanceAndConfiguration } from '@/types'
// import { CHAINS_CONFIG } from '@/config/chains.config'

// /**
//  * v1
//  */

// export function transformTrade(trade: TradeWithInstanceAndConfiguration) {
//     try {
//         const instance = trade.Instance
//         const configuration = instance.Configuration
//         if (!configuration) return null
//         const tradeValues = trade.values as unknown as TradeValuesV2
//         const tokenIn = configuration.baseTokenSymbol
//         const tokenOut = configuration.quoteTokenSymbol

//         return {
//             instanceId: trade.Instance.id,
//             chain: configuration.chainId.toString(),
//             chainName: CHAINS_CONFIG[configuration.chainId]?.name || 'Unknown',
//             tokenIn: {
//                 symbol: tokenIn,
//                 amount: tradeValues.data.metadata.amount_in_normalized.toString(),
//                 valueUsd: tradeValues.data.metadata.amount_in_normalized,
//             },
//             tokenOut: {
//                 symbol: tokenOut,
//                 amount: tradeValues.data.metadata.amount_out_expected.toString(),
//                 valueUsd: tradeValues.data.metadata.amount_out_expected,
//             },
//             status: TradeStatus.SUCCESS,
//             gasCost: {
//                 amount: tradeValues.data.metadata.gas_cost_usd.toString(),
//                 valueUsd: 0,
//             },
//             netProfit: {
//                 amount: tradeValues.data.metadata.profit_delta_bps.toString(),
//                 valueUsd: 0,
//             },
//             timestamp: trade.createdAt,
//             txHash: tradeValues.data.broadcast.hash,
//         }
//     } catch (error) {
//         logger.error(error)
//         return null
//     }
// }

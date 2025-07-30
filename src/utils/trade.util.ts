// import { TradeData } from '@/interfaces'
// import { TradeStatus } from '@/enums'
// import { TradeWithInstanceAndConfiguration } from '@/types'

// /**
//  * v1
//  */

// export function transformTrade(trade: TradeWithInstanceAndConfiguration): TradeData {
//     const instance = trade.Instance
//     const configuration = instance.Configuration

//     const tokenIn = configuration.baseTokenSymbol
//     const tokenOut = configuration.quoteTokenSymbol

//     return {
//         id: trade.id,
//         instanceId: trade.instanceId,
//         chain: configuration?.chain || 'ethereum',
//         chainName: configuration?.chain === 'ethereum' ? 'Ethereum' : 'Unichain',
//         tokenIn: {
//             symbol: tokenIn,
//             amount: 0,
//             valueUsd: 0,
//         },
//         tokenOut: {
//             symbol: tokenOut,
//             amount: 0,
//             valueUsd: 0,
//         },
//         pool: {
//             protocol: 'Unknown',
//             address: '0x0000000000000000000000000000000000000000',
//             fee: 0,
//         },
//         status: TradeStatus.SUCCESS,
//         gasCost: {
//             amount: 0,
//             valueUsd: 0,
//         },
//         netProfit: {
//             amount: 0,
//             valueUsd: 0,
//         },
//         timestamp: trade.createdAt,
//         txHash: trade.hash,
//     }
// }

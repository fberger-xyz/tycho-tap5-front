import { ApiTrade, TradeData } from '@/interfaces'
import { TradeStatus } from '@/enums'

/**
 * v1
 */

export function transformTrade(trade: ApiTrade): TradeData {
    return {
        id: trade.id,
        instanceId: trade.instanceId,
        chain: trade.Instance?.chain || 'ethereum',
        chainName: trade.Instance?.chain === 'ethereum' ? 'Ethereum' : 'Unichain',
        tokenIn: {
            symbol: trade.tokenInSymbol,
            amount: trade.tokenInAmount,
            valueUsd: trade.tokenInValueUsd,
        },
        tokenOut: {
            symbol: trade.tokenOutSymbol,
            amount: trade.tokenOutAmount,
            valueUsd: trade.tokenOutValueUsd,
        },
        pool: {
            protocol: trade.protocol || 'Unknown',
            address: trade.poolAddress,
            fee: trade.poolFee,
        },
        status: trade.status || TradeStatus.SUCCESS,
        gasCost: trade.gasCost
            ? {
                  amount: trade.gasCost,
                  valueUsd: trade.gasCostUsd,
              }
            : undefined,
        netProfit:
            trade.netProfit !== null && trade.netProfit !== undefined
                ? {
                      amount: trade.netProfit.toString(),
                      valueUsd: trade.netProfitUsd,
                  }
                : undefined,
        timestamp: trade.createdAt,
        txHash: trade.transactionHash,
    }
}

/**
 * v2
 */

// export function transformTradeV2(trade: ApiTrade): TradeData {
//     return {
//         id: trade.id,
//         instanceId: trade.instanceId,
//     }
// }

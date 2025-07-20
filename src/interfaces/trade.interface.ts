import { TradeStatus } from '@/enums'

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

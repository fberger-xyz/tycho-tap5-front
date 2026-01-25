import { isSuccessfulTrade, TradeValuesV2 } from '@/interfaces/database/trade.interface'
import { Strategy } from '@/types'

// counts successful trades from a single instance
export function countInstanceTrades(instance: Strategy['instances'][number]): number {
    return instance.value.trades.filter((trade) => {
        const values = trade.values as unknown as TradeValuesV2
        if (!values?.data?.broadcast?.receipt) return false
        return isSuccessfulTrade(values)
    }).length
}

// counts successful trades across all instances
export function countStrategyTrades(strategy: Strategy): number {
    return strategy.instances.reduce((acc, instance) => acc + countInstanceTrades(instance), 0)
}

// counts successful trades across all strategies
export function countTotalTrades(strategies: Strategy[]): number {
    return strategies.reduce((acc, strategy) => acc + countStrategyTrades(strategy), 0)
}

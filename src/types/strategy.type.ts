import { Configuration, Trade } from '@prisma/client'
import { ChainConfig, ParsedConfigurationValues, TokenConfig } from '@/interfaces'
import { InstanceWithCounts } from './instance.type'

// pair -> chain -> config > instances[]
export type Strategy = {
    base: TokenConfig
    quote: TokenConfig
    pair: string
    config: ParsedConfigurationValues

    // metrics
    instancesCount: number
    tradesCount: number
    pnl: number
    // todo

    // chains
    chains: {
        value: ChainConfig
        configurations: {
            value: Configuration
            instances: {
                value: InstanceWithCounts & { trades: Trade[] }
            }[]
        }[]
    }[]
}

import { Trade } from '@prisma/client'
import { ParsedConfigurationValues, TokenConfig } from '@/interfaces'
import { InstanceWithCounts } from './instance.type'
import { AppSupportedChainIds } from '@/enums'

// pair -> chain -> config > instances[]
export type Strategy = {
    chainId: AppSupportedChainIds
    base: TokenConfig
    quote: TokenConfig
    config: ParsedConfigurationValues

    // metrics
    pnlUsd: number
    aumUsd: number
    priceUsd: number
    tradesCount: number

    // instances
    instances: {
        value: InstanceWithCounts & { trades: Trade[] }
    }[]
}

import { AppSupportedChainIds, AppUrls, FileIds } from '../enums'

export interface InterfaceAppLink {
    name: string
    path: AppUrls
}

export interface StructuredOutput<Data> {
    success: boolean
    data?: Data
    error: string
}

export interface ChainConfig {
    id: AppSupportedChainIds
    fileId: FileIds
    name: string
    oneInchId: string
    supported: boolean
    explorerRoot: string
    suggestedTokens: { symbol: string; address: string }[]
}

export interface TokenConfig {
    address: string
    decimals: number
    symbol: string
}

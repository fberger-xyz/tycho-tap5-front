import { AppSupportedChainIds } from '@/enums/app.enum'
import { ChainConfig } from '@/interfaces'

export const CHAINS_CONFIG: Record<number, ChainConfig> = {
    [AppSupportedChainIds.ETHEREUM]: {
        id: AppSupportedChainIds.ETHEREUM,
        name: 'Ethereum',
        oneInchId: 'ethereum',
        supported: true,
        explorerRoot: 'https://etherscan.io',
        nativeToken: {
            symbol: 'ETH',
            decimals: 18,
        },
        debankId: 'eth',
    },
    [AppSupportedChainIds.UNICHAIN]: {
        id: AppSupportedChainIds.UNICHAIN,
        name: 'Unichain',
        oneInchId: 'unichain',
        supported: true,
        explorerRoot: 'https://unichain.blockscout.com',
        nativeToken: {
            symbol: 'ETH',
            decimals: 18,
        },
        debankId: 'uni',
    },
    [AppSupportedChainIds.BASE]: {
        id: AppSupportedChainIds.BASE,
        name: 'Base',
        oneInchId: 'base',
        supported: true,
        explorerRoot: 'https://basescan.org',
        nativeToken: {
            symbol: 'ETH',
            decimals: 18,
        },
        debankId: 'base',
    },
}

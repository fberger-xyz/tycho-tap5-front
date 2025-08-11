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
        chainlinkFeeds: {
            'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
            'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
            'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
            'DAI/USD': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
            'USDT/USD': '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
            'WBTC/BTC': '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23',
        },
        idForOrderbookApi: 'ethereum',
        showTopUpBannerIfEthBalanceBelow: 0.005, // 0.001 ETH
    },
    [AppSupportedChainIds.UNICHAIN]: {
        id: AppSupportedChainIds.UNICHAIN,
        name: 'Unichain',
        oneInchId: 'unichain',
        supported: true,
        explorerRoot: 'https://uniscan.xyz',
        nativeToken: {
            symbol: 'ETH',
            decimals: 18,
        },
        debankId: 'uni',
        chainlinkFeeds: {
            // Chainlink feeds for Unichain will be added when available
        },
        idForOrderbookApi: 'unichain',
        showTopUpBannerIfEthBalanceBelow: 0.001, // 0.001 ETH
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
        chainlinkFeeds: {
            // Base mainnet Chainlink price feeds
            'ETH/USD': '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
            'BTC/USD': '0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593',
            'USDC/USD': '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
            'DAI/USD': '0x591e79239a7d679378eC8c847e5038150364C78F',
        },
        idForOrderbookApi: 'base',
        showTopUpBannerIfEthBalanceBelow: 0.001, // 0.001 ETH
    },
}

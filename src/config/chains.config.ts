import { AppSupportedChainIds } from '@/enums/app.enum'
import { FileIds } from '@/enums/files.enum'
import { ChainConfig } from '@/interfaces'

export const CHAINS_CONFIG: Record<number, ChainConfig> = {
    [AppSupportedChainIds.ETHEREUM]: {
        id: AppSupportedChainIds.ETHEREUM,
        fileId: FileIds.MAINNET,
        name: 'Ethereum',
        oneInchId: 'ethereum',
        supported: true,
        explorerRoot: 'https://etherscan.io',
        suggestedTokens: [
            { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
            { symbol: 'wstETH', address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0' },
            { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
            { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
            { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
            { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
        ],
    },
    [AppSupportedChainIds.UNICHAIN]: {
        id: AppSupportedChainIds.UNICHAIN,
        fileId: FileIds.UNICHAIN,
        name: 'Unichain',
        oneInchId: 'unichain',
        supported: true,
        explorerRoot: 'https://unichain.blockscout.com',
        suggestedTokens: [
            { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000' },
            { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006' },
            { symbol: 'wstETH', address: '0xc02fe7317d4eb8753a02c35fe019786854a92001' },
            { symbol: 'USDC', address: '0x078d782b760474a361dda0af3839290b0ef57ad6' },
            { symbol: 'UNI', address: '0x7dcc39b4d1c53cb31e1abc0e358b43987fef80f7' },
            { symbol: 'WBTC', address: '0x927b51f251480a681271180da4de28d44ec4afb8' },
        ],
    },
}

'use client'

import OneInchCandlestickChart from './OneInchCandlestickChart'

// Example usage with USDT/USDC pair on Ethereum mainnet
export default function ExampleCandlestickUsage() {
    // USDT address on Ethereum
    const USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    // USDC address on Ethereum
    const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">USDT/USDC 5-minute Chart</h2>
            <OneInchCandlestickChart
                token0={USDT}
                token1={USDC}
                seconds={300} // 5 minutes
                chainId={1} // Ethereum
                symbol="USDT/USDC"
            />
        </div>
    )
}

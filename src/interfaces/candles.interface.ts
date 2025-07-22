/**
 * ------------------------ generic
 */

export interface CandlestickDataPoint {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

export interface CandlestickChartProps {
    data: CandlestickDataPoint[] | null
    isLoading?: boolean
    error?: Error | null
    symbol?: string
    baseSymbol?: string
    quoteSymbol?: string
    upColor?: string
    downColor?: string
    // loadingMessage?: string
}

/**
 * ------------------------ 1inch
 */

export interface CandleData {
    time: number
    open: number
    high: number
    low: number
    close: number
}

export interface CandlesResponse {
    data: CandleData[]
}

export interface Use1inchCandlesParams {
    token0: string
    token1: string
    seconds: number
    chainId: number
    enabled?: boolean
}

export interface OneInchCandlestickChartProps {
    token0: string
    token1: string
    seconds?: number
    chainId?: number
    symbol?: string
    upColor?: string
    downColor?: string
}

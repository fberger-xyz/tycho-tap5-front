// Chart configuration constants
export const CHART_CONSTANTS = {
    // Time series data retention
    DATA_WINDOW_MINUTES: 5,
    MIN_DATA_POINTS: 2, // Need at least 2 points to draw a line
    MIN_UPDATE_INTERVAL_RATIO: 0.8,

    // Price formatting
    PRICE_DECIMAL_PLACES: 2,

    // Default refresh intervals (ms)
    DEFAULT_REFRESH_INTERVAL: 12000,
    BINANCE_RETRY_DELAY: 5000,

    // Chart display
    LEGEND_MAX_ITEMS: 10,
    TOOLTIP_HIDE_DELAY: 0,
    ANIMATION_DURATION: 2000,
} as const

// Helper functions
export const roundPrice = (price: number): number => {
    return Math.round(price * Math.pow(10, CHART_CONSTANTS.PRICE_DECIMAL_PLACES)) / Math.pow(10, CHART_CONSTANTS.PRICE_DECIMAL_PLACES)
}

export const formatPriceForDisplay = (price: number): string => {
    return price.toFixed(CHART_CONSTANTS.PRICE_DECIMAL_PLACES)
}

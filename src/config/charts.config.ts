import { ChartIntervalInSeconds, ChartType } from '@/enums/app.enum'

export const INTERVAL_LABELS = (interval: ChartIntervalInSeconds) => {
    switch (interval) {
        case ChartIntervalInSeconds.FIVE_MINUTES:
            return '5m'
        case ChartIntervalInSeconds.FIFTEEN_MINUTES:
            return '15m'
        case ChartIntervalInSeconds.ONE_HOUR:
            return '1h'
        case ChartIntervalInSeconds.FOUR_HOURS:
            return '4h'
        case ChartIntervalInSeconds.ONE_DAY:
            return '1d'
    }
}

export const CHART_CONFIG: Record<
    ChartType,
    { name: string; enabled: boolean; defaultInterval: ChartIntervalInSeconds; allowedIntervals: ChartIntervalInSeconds[] }
> = {
    [ChartType.CANDLES]: {
        name: 'Price',
        enabled: true,
        defaultInterval: ChartIntervalInSeconds.FIVE_MINUTES,
        allowedIntervals: [
            ChartIntervalInSeconds.FIVE_MINUTES,
            ChartIntervalInSeconds.FIFTEEN_MINUTES,
            ChartIntervalInSeconds.ONE_HOUR,
            ChartIntervalInSeconds.FOUR_HOURS,
            ChartIntervalInSeconds.ONE_DAY,
        ],
    },
    [ChartType.PNL]: {
        name: 'PnL',
        enabled: false,
        defaultInterval: ChartIntervalInSeconds.FIVE_MINUTES,
        allowedIntervals: [
            ChartIntervalInSeconds.FIVE_MINUTES,
            ChartIntervalInSeconds.FIFTEEN_MINUTES,
            ChartIntervalInSeconds.ONE_HOUR,
            ChartIntervalInSeconds.FOUR_HOURS,
            ChartIntervalInSeconds.ONE_DAY,
        ],
    },
    [ChartType.SPREAD]: {
        name: 'Spread',
        enabled: true,
        defaultInterval: ChartIntervalInSeconds.FIVE_MINUTES,
        allowedIntervals: [], // No intervals needed for real-time view
    },
    [ChartType.AUM]: {
        name: 'AUM',
        enabled: false,
        defaultInterval: ChartIntervalInSeconds.FIVE_MINUTES,
        allowedIntervals: [
            ChartIntervalInSeconds.FIVE_MINUTES,
            ChartIntervalInSeconds.FIFTEEN_MINUTES,
            ChartIntervalInSeconds.ONE_HOUR,
            ChartIntervalInSeconds.FOUR_HOURS,
            ChartIntervalInSeconds.ONE_DAY,
        ],
    },
    // [ChartType.INVENTORY]: {
    //     name: 'Inventory',
    //     enabled: false,
    //     defaultInterval: ChartIntervalInSeconds.FIVE_MINUTES,
    //     allowedIntervals: [
    //         ChartIntervalInSeconds.FIVE_MINUTES,
    //         ChartIntervalInSeconds.FIFTEEN_MINUTES,
    //         ChartIntervalInSeconds.ONE_HOUR,
    //         ChartIntervalInSeconds.FOUR_HOURS,
    //         ChartIntervalInSeconds.ONE_DAY,
    //     ],
    // },
}

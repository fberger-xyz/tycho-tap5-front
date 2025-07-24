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
        name: 'Candles',
        enabled: true,
        defaultInterval: ChartIntervalInSeconds.ONE_HOUR,
        allowedIntervals: [
            ChartIntervalInSeconds.FIVE_MINUTES,
            ChartIntervalInSeconds.FIFTEEN_MINUTES,
            ChartIntervalInSeconds.ONE_HOUR,
            ChartIntervalInSeconds.FOUR_HOURS,
            ChartIntervalInSeconds.ONE_DAY,
        ],
    },
    [ChartType.PNL]: {
        name: 'P&L',
        enabled: false,
        defaultInterval: ChartIntervalInSeconds.ONE_HOUR,
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
        enabled: false,
        defaultInterval: ChartIntervalInSeconds.ONE_HOUR,
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
    //     defaultInterval: ChartIntervalInSeconds.ONE_HOUR,
    //     allowedIntervals: [
    //         ChartIntervalInSeconds.FIVE_MINUTES,
    //         ChartIntervalInSeconds.FIFTEEN_MINUTES,
    //         ChartIntervalInSeconds.ONE_HOUR,
    //         ChartIntervalInSeconds.FOUR_HOURS,
    //         ChartIntervalInSeconds.ONE_DAY,
    //     ],
    // },
}

import { ChartIntervalInSeconds, ChartType } from '@/enums/app.enum'

export const CHART_CONFIG: Record<
    ChartType,
    { name: string; enabled: boolean; defaultInterval: ChartIntervalInSeconds; allowedIntervals: ChartIntervalInSeconds[] }
> = {
    [ChartType.CANDLES]: {
        name: 'Candles',
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
        name: 'P&L',
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
    [ChartType.INVENTORY]: {
        name: 'Inventory',
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
}

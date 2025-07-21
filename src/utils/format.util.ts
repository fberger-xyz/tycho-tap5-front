import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const shortenValue = (value: string, chars = 3) => {
    if (chars >= value.length) return value
    return `${value.slice(0, chars)}...${value.slice(-chars)}`
}

export const cleanOutput = (output: string | number, defaultOutput = '-'): string => {
    const strOutput = String(output).replaceAll('~', '').replaceAll(' ', '')
    if (strOutput === '0') return defaultOutput
    if (strOutput === '0%') return defaultOutput
    if (strOutput === '0$') return defaultOutput
    if (strOutput === '0k$') return defaultOutput
    if (strOutput === '0m$') return defaultOutput
    if (strOutput === 'NaN') return defaultOutput
    return String(output)
}

const DATE_FORMAT = 'ddd. MMM. D ∙ hh:mm A'
const DATE_FORMAT_SHORT = 'MMM. D ∙ hh:mm A'
const DAY_FORMAT = 'MMM. D'

export const formatDate = (date: Date | number | string): string => {
    return dayjs(date).utc().format(DATE_FORMAT) + ' UTC'
}

export const formatDateShort = (date: Date | number | string): string => {
    return dayjs(date).utc().format(DATE_FORMAT_SHORT) + ' UTC'
}

export const formatDay = (date: Date | number | string): string => {
    return dayjs(date).utc().format(DAY_FORMAT)
}

export const formatTradeTimestamp = (timestamp: Date | string | number) => ({
    formattedTimestamp: dayjs(timestamp).format('MMM D, HH:mm:ss'),
    formattedTimeAgo: dayjs(timestamp).fromNow(),
})

export const dateHelpers = {
    formatDate: (date: Date | string | number) => dayjs(date).format('MMM D, HH:mm:ss'),
    formatDateShort: (date: Date | string | number) => dayjs(date).format('MMM D, HH:mm:ss'),
    formatDay: (date: Date | string | number) => dayjs(date).format('MMM D'),
    formatTradeTimestamp: (timestamp: Date | string | number) => ({
        formattedTimestamp: dayjs(timestamp).format('MMM D, HH:mm:ss'),
        formattedTimeAgo: dayjs(timestamp).fromNow(),
    }),
}

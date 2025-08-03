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
    if (strOutput.includes('NaN')) return defaultOutput
    return String(output)
}

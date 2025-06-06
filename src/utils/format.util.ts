export const shortenAddress = (address: string, chars = 4) => {
    if (address.length < chars) return '0xMissing address'
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
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

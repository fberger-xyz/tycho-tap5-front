enum LogType {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

// parse enabled logs from env
const getEnabledLogs = (): Set<LogType> => {
    const env = process.env.NEXT_PUBLIC_LOG?.toLowerCase().trim()

    // default to info level if no env configured
    if (!env) return new Set([LogType.ERROR, LogType.WARN, LogType.INFO])

    // all logs
    if (env === 'all') return new Set(Object.values(LogType))

    // explicit none
    if (env === 'none') return new Set()

    // map env
    return new Set(env.split(',').map((type) => type.trim() as LogType))
}

class Logger {
    private readonly enabled: Set<LogType>
    private readonly prefix: string

    constructor(prefix?: string) {
        this.enabled = getEnabledLogs()
        this.prefix = prefix || ''
    }

    // format timestamp as HH:MM:SS.mmm
    private getTimestamp(): string {
        return new Date().toISOString().split('T')[1].slice(0, 12)
    }

    private format(message: string): string {
        const timestamp = `[${this.getTimestamp()}]`
        return this.prefix ? `${timestamp} [${this.prefix}] ${message}` : `${timestamp} ${message}`
    }

    // create child logger with prefix
    withPrefix(prefix: string): Logger {
        return new Logger(prefix)
    }

    error(message: string, data?: Record<string, unknown>) {
        if (this.enabled.has(LogType.ERROR)) console.error(this.format(message), data ?? '')
    }

    warn(message: string, data?: Record<string, unknown>) {
        if (this.enabled.has(LogType.WARN)) console.warn(this.format(message), data ?? '')
    }

    info(message: string, data?: Record<string, unknown>) {
        if (this.enabled.has(LogType.INFO)) console.log(this.format(message), data ?? '')
    }

    debug(message: string, data?: Record<string, unknown>) {
        if (this.enabled.has(LogType.DEBUG)) console.log(this.format(message), data ?? '')
    }
}

// singleton instance
export const logger = new Logger()

// export type for use elsewhere
export type { Logger }
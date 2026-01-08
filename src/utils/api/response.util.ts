import { NextResponse } from 'next/server'
import { logger } from '@/utils/logger.util'

export interface ApiErrorOptions {
    status?: number
    details?: unknown
}

export const createApiError = (message: string, options: ApiErrorOptions = {}): NextResponse => {
    const { status = 500, details } = options

    if (details) {
        logger.error(`API Error: ${message}`, details as Record<string, unknown> || {})
    }

    return NextResponse.json({ error: message }, { status })
}

export const createApiSuccess = <T>(data: T, options?: { headers?: HeadersInit }): NextResponse => {
    return NextResponse.json(data, options)
}

export const handleApiError = (error: unknown, context: string): NextResponse => {
    logger.error(`Failed to ${context}:`, { error: error instanceof Error ? error.message : String(error) })

    if (error instanceof Error) {
        if (error.message.includes('P2002') || error.message.includes('database')) {
            return createApiError('Database connection error. Please try again later.', { status: 503 })
        }

        if (error.message.includes('Prisma') || error.message.includes('Invalid')) {
            return createApiError('Data access error. Please contact support if this persists.', { status: 500 })
        }
    }

    return createApiError(`Failed to ${context}`, { status: 500, details: error })
}

import { NextResponse } from 'next/server'

export interface ApiErrorOptions {
    status?: number
    details?: unknown
}

export const createApiError = (message: string, options: ApiErrorOptions = {}): NextResponse => {
    const { status = 500, details } = options

    if (details) {
        console.error(`API Error: ${message}`, details)
    }

    return NextResponse.json({ error: message }, { status })
}

export const createApiSuccess = <T>(data: T): NextResponse => {
    return NextResponse.json(data)
}

export const handleApiError = (error: unknown, context: string): NextResponse => {
    console.error(`Failed to ${context}:`, error)

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

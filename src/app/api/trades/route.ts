import { getTrades } from '@/queries/trades.query'
import { parsePaginationParams } from '@/utils/api/params.util'
import { createApiError, createApiSuccess, handleApiError } from '@/utils/api/response.util'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const { limit, skip, error } = parsePaginationParams(searchParams)
        if (error) return createApiError(error, { status: 400 })
        const trades = await getTrades({ limit, skip })
        return createApiSuccess({ trades })
    } catch (error) {
        return handleApiError(error, 'fetch trades')
    }
}

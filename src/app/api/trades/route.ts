import { getTrades } from '@/queries/trades.query'
import { parsePaginationParams } from '@/utils/api/params.util'
import { createApiError, createApiSuccess, handleApiError } from '@/utils/api/response.util'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const { limit, skip, error } = parsePaginationParams(searchParams)
        if (error) return createApiError(error, { status: 400 })
        const configurationId = searchParams.get('configurationId') || undefined
        const trades = await getTrades({ limit, skip, configurationId })

        // Aggressive caching for 5 users - cache for 3 seconds
        return createApiSuccess(
            { trades },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=10',
                },
            },
        )
    } catch (error) {
        return handleApiError(error, 'fetch trades')
    }
}

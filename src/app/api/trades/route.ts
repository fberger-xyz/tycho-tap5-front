import prisma from '@/clients/prisma'
import { parsePaginationParams } from '@/utils/api/params.util'
import { createApiError, createApiSuccess, handleApiError } from '@/utils/api/response.util'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const { limit, skip, error } = parsePaginationParams(searchParams)

        if (error) {
            return createApiError(error, { status: 400 })
        }

        const trades = await prisma.trade.findMany({
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                Instance: true,
            },
        })
        return createApiSuccess({ trades })
    } catch (error) {
        return handleApiError(error, 'fetch trades')
    }
}

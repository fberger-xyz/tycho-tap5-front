import prisma from '@/clients/prisma'
import { parsePaginationParams } from '@/utils/api/params.util'
import { createApiSuccess, createApiError, handleApiError } from '@/utils/api/response.util'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const { limit, skip, error } = parsePaginationParams(searchParams)
        const instanceId = searchParams.get('instanceId')

        if (error) {
            return createApiError(error, { status: 400 })
        }

        const where = instanceId ? { instanceId } : {}

        const prices = await prisma.price.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                Instance: true,
            },
        })

        return createApiSuccess({ prices })
    } catch (error) {
        return handleApiError(error, 'fetch prices')
    }
}

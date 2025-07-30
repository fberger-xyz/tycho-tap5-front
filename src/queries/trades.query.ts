import { prisma } from '@/clients/prisma'
import { TradeWithInstanceAndConfiguration } from '@/types'

export async function getTrades({ limit = 10, skip = 0 }: { limit?: number; skip?: number }): Promise<TradeWithInstanceAndConfiguration[]> {
    return prisma.trade.findMany({
        take: limit,
        skip: skip,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            Instance: {
                include: {
                    Configuration: true,
                },
            },
        },
    })
}

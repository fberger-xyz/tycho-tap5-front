import { prisma } from '@/clients/prisma'
import { TradeWithInstanceAndConfiguration } from '@/types'

export async function getTrades({
    limit = 1000,
    skip = 0,
    configurationId,
}: {
    limit?: number
    skip?: number
    configurationId?: string
}): Promise<TradeWithInstanceAndConfiguration[]> {
    return prisma.trade.findMany({
        where: configurationId
            ? {
                  Instance: {
                      configurationId: configurationId,
                  },
              }
            : undefined,
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

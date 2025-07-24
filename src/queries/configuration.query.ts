import { prisma } from '@/clients/prisma'

export async function getConfigurationsByTokenPair(baseTokenSymbol: string, quoteTokenSymbol: string) {
    return prisma.configuration.findMany({
        where: {
            baseTokenSymbol,
            quoteTokenSymbol,
        },
        include: {
            Instance: {
                orderBy: { createdAt: 'desc' },
                include: {
                    Trade: {
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            Trade: true,
                            Price: true,
                        },
                    },
                },
            },
        },
    })
}

export async function getConfigurations({ limit = 10, skip = 0 }: { limit?: number; skip?: number }) {
    return prisma.configuration.findMany({
        take: limit,
        skip: skip,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            Instance: {
                orderBy: { startedAt: 'desc' },
                include: {
                    Trade: {
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            Trade: true,
                            Price: true,
                        },
                    },
                },
            },
        },
    })
}

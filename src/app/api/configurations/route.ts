import { NextResponse } from 'next/server'
import prisma from '@/clients/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = parseInt(searchParams.get('skip') || '0')
        const chainId = searchParams.get('chainId')

        const where = chainId ? { chainId: parseInt(chainId) } : {}

        const configurations = await prisma.configuration.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: {
                        Instance: true,
                    },
                },
            },
        })

        return NextResponse.json({ configurations })
    } catch (error) {
        console.error('Failed to fetch configurations:', error)
        return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 })
    }
}

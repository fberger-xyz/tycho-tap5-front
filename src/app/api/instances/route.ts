import { NextResponse } from 'next/server'
import prisma from '@/clients/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = parseInt(searchParams.get('skip') || '0')
        const active = searchParams.get('active') === 'true'

        const where = active ? { endedAt: null } : {}

        const instances = await prisma.instance.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                Configuration: true,
                _count: {
                    select: {
                        Trade: true,
                        Price: true,
                    },
                },
            },
        })

        return NextResponse.json({ instances })
    } catch (error) {
        console.error('Failed to fetch instances:', error)
        return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 })
    }
}

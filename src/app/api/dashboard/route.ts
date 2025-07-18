import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import superjson from 'superjson'

export async function GET() {
    try {
        const configurations = await prisma.configuration.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                Instance: {
                    orderBy: { startedAt: 'desc' },
                    include: {
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

        // Use superjson to properly serialize dates
        const serialized = superjson.stringify({ configurations })
        return new NextResponse(serialized, {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
}

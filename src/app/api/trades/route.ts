import { NextResponse } from 'next/server'
import prisma from '@/clients/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = parseInt(searchParams.get('skip') || '0')

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

        return NextResponse.json({ trades })
    } catch (error) {
        console.error('Failed to fetch trades:', error)
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
    }
}

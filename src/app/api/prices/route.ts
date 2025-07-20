import { NextResponse } from 'next/server'
import prisma from '@/clients/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = parseInt(searchParams.get('skip') || '0')
        const instanceId = searchParams.get('instanceId')

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

        return NextResponse.json({ prices })
    } catch (error) {
        console.error('Failed to fetch prices:', error)
        return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
    }
}

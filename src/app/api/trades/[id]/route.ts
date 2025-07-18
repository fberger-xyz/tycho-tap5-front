import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const trade = await prisma.trade.findUnique({
            where: { id },
            include: {
                Instance: true,
            },
        })

        if (!trade) {
            return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
        }

        return NextResponse.json({ trade })
    } catch (error) {
        console.error('Failed to fetch trade:', error)
        return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 })
    }
}

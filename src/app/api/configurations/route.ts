import { NextResponse } from 'next/server'
import prisma from '@/clients/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = parseInt(searchParams.get('skip') || '0')

        // Validate parameters
        if (limit < 1 || limit > 1000) {
            return NextResponse.json({ error: 'Invalid limit parameter. Must be between 1 and 1000.' }, { status: 400 })
        }

        if (skip < 0) {
            return NextResponse.json({ error: 'Invalid skip parameter. Must be non-negative.' }, { status: 400 })
        }

        const configurations = await prisma.configuration.findMany({
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
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

        return NextResponse.json({ configurations })
    } catch (error) {
        // Log detailed error for debugging
        console.error('Failed to fetch configurations:', error)

        // Determine error type and return appropriate response
        if (error instanceof Error) {
            // Database connection errors
            if (error.message.includes('P2002') || error.message.includes('database')) {
                return NextResponse.json({ error: 'Database connection error. Please try again later.' }, { status: 503 })
            }

            // Generic Prisma errors
            if (error.message.includes('Prisma') || error.message.includes('Invalid')) {
                return NextResponse.json({ error: 'Data access error. Please contact support if this persists.' }, { status: 500 })
            }
        }

        // Generic error response
        return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 })
    }
}

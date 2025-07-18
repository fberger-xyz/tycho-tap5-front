'use client'

import { cn } from '@/utils'

export default function InstanceStatus(props: { status: string }) {
    const statusColors = {
        running: 'text-green-600 bg-green-50',
        stopped: 'text-gray-600 bg-gray-50',
        paused: 'text-yellow-600 bg-yellow-50',
        error: 'text-red-600 bg-red-50',
    } as const

    return <span className={cn('px-2 py-1 rounded-full', statusColors[props.status as keyof typeof statusColors])}>{props.status}</span>
}

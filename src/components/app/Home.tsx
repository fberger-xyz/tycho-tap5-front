'use client'

import { useQueries } from '@tanstack/react-query'
import { extractErrorMessage } from '@/utils'
import toast from 'react-hot-toast'

export default function Home() {
    useQueries({
        queries: [
            {
                queryKey: ['homeQuery'],
                enabled: true,
                queryFn: async () => {
                    try {
                        console.log(`homeQuery: done`)
                        return null
                    } catch (error) {
                        toast.error(`homeQuery: ${extractErrorMessage(error)}`)
                    }
                },
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchInterval: 1000 * 30,
            },
        ],
    })

    return (
        <div className="flex flex-col w-full gap-8">
            <p>Todo</p>
        </div>
    )
}

'use client'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
dayjs.extend(relativeTime)

import { cn } from '@/utils'
import DeployedAt from '../app/DeployedAt'
import { SITE_URL } from '@/config/app.config'

export default function Footer(props: { className?: string }) {
    const [commitDate, setCommitDate] = useState<null | Date>(null)
    useEffect(() => {
        const timestamp = process.env.NEXT_PUBLIC_COMMIT_TIMESTAMP
        if (timestamp) {
            const date = new Date(parseInt(timestamp, 10) * 1000)
            setCommitDate(date)
        }
    }, [])
    if (!commitDate) return null
    return (
        <footer
            className={cn(
                'w-full flex flex-col items-center lg:flex-row lg:justify-between lg:items-end py-4 px-8 font-light text-xs gap-1',
                props.className,
            )}
        >
            {/* left */}
            <div className="flex flex-col gap-1 lg:gap-8 lg:flex-row items-center">
                <p className="truncate opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out">
                    2025 © {SITE_URL.replace('https://', '')}
                </p>
            </div>

            {/* right */}
            <div className="flex flex-col lg:flex-row gap-1 lg:gap-8 items-center">
                <DeployedAt commitDate={commitDate} />
            </div>
        </footer>
    )
}

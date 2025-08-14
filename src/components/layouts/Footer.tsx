'use client'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { cn } from '@/utils'
import StyledTooltip from '../common/StyledTooltip'
import { env } from '@/env/t3-env'
import Authors from './Authors'
dayjs.extend(utc)
dayjs.extend(relativeTime)

export default function Footer(props: { className?: string }) {
    const [commitDate, setCommitDate] = useState<null | Date>(null)
    useEffect(() => {
        const timestamp = env.NEXT_PUBLIC_COMMIT_TIMESTAMP
        if (timestamp) {
            const date = new Date(parseInt(timestamp, 10) * 1000)
            setCommitDate(date)
        }
    }, [])
    if (!commitDate) return null
    return (
        <footer
            className={cn(
                'flex w-full flex-col gap-6 px-6 py-4 text-xs font-light text-milk-400 lg:flex-row lg:items-end lg:justify-between lg:gap-0',
                props.className,
            )}
        >
            {/* left */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                <p className="hidden truncate lg:flex">2025 © PropellerHeads</p>
                <StyledTooltip closeDelay={500} content={<p>Deployed on {dayjs.utc(commitDate).format('D MMM. YYYY HH:mm A')} UTC</p>}>
                    <p className="truncate hover:text-aquamarine hover:underline">Alpha version</p>
                </StyledTooltip>
            </div>

            {/* right */}
            <Authors className="md:justify-start lg:justify-end" />
        </footer>
    )
}

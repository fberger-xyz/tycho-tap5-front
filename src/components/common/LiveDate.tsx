'use client'

import { cn, DAYJS_FORMATS, getDurationBetween } from '@/utils'
import StyledTooltip from './StyledTooltip'
import { useState } from 'react'
import { useEffect } from 'react'

export function LiveDate(props: { date: string | number | Date; className?: string; children?: React.ReactNode }) {
    const [now, setNow] = useState(new Date())
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])
    return (
        <StyledTooltip
            disableAnimation={true}
            content={
                <div>
                    <p>{DAYJS_FORMATS.date(props.date)} UTC</p>
                    <p>
                        {
                            getDurationBetween({
                                startTs: new Date(props.date).getTime(),
                                endTs: now.getTime(),
                                showYears: false,
                                showMonths: false,
                                showWeeks: false,
                            }).oneLiner
                        }{' '}
                        ago
                    </p>
                    {/* <p>{DAYJS_FORMATS.timeAgo(props.date)}</p> */}
                </div>
            }
        >
            <p className={cn('truncate hover:underline', props.className)}>{props.children}</p>
        </StyledTooltip>
    )
}

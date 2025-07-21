'use client'

import { cn, dateHelpers, getDurationBetween } from '@/utils'
import StyledTooltip from './StyledTooltip'
// import useTimeAgo from '@/hooks/useTimeAgo'

export function LiveDate(props: { date: string | number | Date; className?: string; children?: React.ReactNode }) {
    // const timeago = useTimeAgo(props.date)
    return (
        <StyledTooltip
            disableAnimation={true}
            content={
                <div>
                    <p>{dateHelpers.formatDate(props.date)}</p>
                    <p>
                        {
                            getDurationBetween({
                                startTs: new Date(props.date).getTime(),
                                endTs: new Date().getTime(),
                                showYears: false,
                                showMonths: false,
                                showWeeks: false,
                            }).oneLiner
                        }{' '}
                        ago
                    </p>
                    {/* <p>{timeago}</p> */}
                </div>
            }
        >
            <p className={cn('truncate', props.className)}>{props.children}</p>
        </StyledTooltip>
    )
}

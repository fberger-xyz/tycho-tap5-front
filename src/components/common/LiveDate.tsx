'use client'

import { cn, DAYJS_FORMATS, getDurationBetween } from '@/utils'
import StyledTooltip from './StyledTooltip'
// import useTimeAgo from '@/hooks/useTimeAgo'

export function LiveDate(props: { date: string | number | Date; className?: string; children?: React.ReactNode }) {
    // const timeago = useTimeAgo(props.date)
    return (
        <StyledTooltip
            disableAnimation={true}
            content={
                <div>
                    <p>{DAYJS_FORMATS.date(props.date)}</p>
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
                    {/* <p>{DAYJS_FORMATS.timeAgo(props.date)}</p> */}
                </div>
            }
        >
            <p className={cn('truncate hover:underline', props.className)}>{props.children}</p>
        </StyledTooltip>
    )
}

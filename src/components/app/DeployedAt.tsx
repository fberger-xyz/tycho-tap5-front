'use client'

import useTimeAgo from '@/hooks/useTimeAgo'
import StyledTooltip from '../common/StyledTooltip'
import dayjs from 'dayjs'

export default function DeployedAt(props: { commitDate: null | Date }) {
    const timeago = useTimeAgo(props.commitDate ?? Date.now())
    if (timeago.includes('year')) return null
    if (timeago.includes('now')) return null
    return (
        <StyledTooltip closeDelay={500} content={<p>Deployed on {dayjs.utc(props.commitDate).format('D MMM. YYYY HH:mm A')} UTC</p>}>
            <p className="opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out">UI deployed {timeago}</p>
        </StyledTooltip>
    )
}

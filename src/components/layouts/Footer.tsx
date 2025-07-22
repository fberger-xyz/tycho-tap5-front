'use client'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { cn } from '@/utils'
import StyledTooltip from '../common/StyledTooltip'
import IframeWrapper from '../common/IframeWrapper'
import { AppUrls } from '@/enums'
import LinkWrapper from '../common/LinkWrapper'
import { env } from '@/env/t3-env'
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
                'w-full flex flex-col lg:flex-row lg:justify-between lg:items-end py-6 px-8 text-milk-400 font-light text-sm gap-6 lg:gap-0',
                props.className,
            )}
        >
            {/* left */}
            <div className="flex lg:gap-8 flex-col gap-6 lg:flex-row">
                <p className="truncate hidden lg:flex">2025 © PropellerHeads</p>
                <StyledTooltip closeDelay={500} content={<p>Deployed on {dayjs.utc(commitDate).format('D MMM. YYYY HH:mm A')} UTC</p>}>
                    <p className="truncate hover:underline hover:text-aquamarine">Alpha version</p>
                </StyledTooltip>
            </div>

            {/* right */}
            <p className="text-wrap lg:text-right">
                Made by
                <StyledTooltip placement="top" closeDelay={500} content={<IframeWrapper src={AppUrls.PROPELLERHEADS_WEBSITE} />}>
                    <LinkWrapper
                        href={AppUrls.PROPELLERHEADS_WEBSITE}
                        target="_blank"
                        className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine px-1"
                    >
                        PropellerHeads,
                    </LinkWrapper>
                </StyledTooltip>
                <LinkWrapper
                    href={AppUrls.QUANT_TELEGRAM}
                    target="_blank"
                    className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine"
                >
                    @hugoschrng
                </LinkWrapper>
                ,
                <StyledTooltip placement="top" closeDelay={500} content={<IframeWrapper src={AppUrls.MERSO_WEBSITE} />}>
                    <LinkWrapper
                        href={AppUrls.FBERGER_WEBSITE}
                        target="_blank"
                        className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine px-1"
                    >
                        xMerso
                    </LinkWrapper>
                </StyledTooltip>
                and
                <StyledTooltip placement="top" closeDelay={500} content={<IframeWrapper src={AppUrls.FBERGER_WEBSITE} />}>
                    <LinkWrapper
                        href={AppUrls.FBERGER_WEBSITE}
                        target="_blank"
                        className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine px-1"
                    >
                        fberger_xyz
                    </LinkWrapper>
                </StyledTooltip>
            </p>
        </footer>
    )
}

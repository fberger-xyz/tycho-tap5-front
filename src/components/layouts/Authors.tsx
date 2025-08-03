'use client'

import StyledTooltip from '../common/StyledTooltip'
import IframeWrapper from '../common/IframeWrapper'
import { AppUrls } from '@/enums'
import LinkWrapper from '../common/LinkWrapper'
import { cn } from '@/utils'

export default function Authors(props: { className?: string }) {
    return (
        <div className={cn('flex flex-wrap gap-x-1', props.className)}>
            <p className="text-wrap lg:text-right">
                Made by
                <StyledTooltip placement="top" closeDelay={500} content={<IframeWrapper src={AppUrls.PROPELLERHEADS_WEBSITE} />}>
                    <LinkWrapper
                        href={AppUrls.PROPELLERHEADS_WEBSITE}
                        target="_blank"
                        className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine pl-1"
                    >
                        PropellerHeads,
                    </LinkWrapper>
                </StyledTooltip>
            </p>
            <p className="text-wrap lg:text-right">
                <StyledTooltip placement="top" closeDelay={500} content={<IframeWrapper src={AppUrls.MERSO_WEBSITE} />}>
                    <LinkWrapper
                        href={AppUrls.MERSO_WEBSITE}
                        target="_blank"
                        className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine pr-1"
                    >
                        xMerso
                    </LinkWrapper>
                </StyledTooltip>
                and
            </p>
            <p className="text-wrap lg:text-right">
                <LinkWrapper
                    href={AppUrls.QUANT_TELEGRAM}
                    target="_blank"
                    className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine"
                >
                    @hugoschrng,
                </LinkWrapper>
            </p>
            <p className="text-wrap lg:text-right">
                <StyledTooltip placement="top" closeDelay={500} content={<IframeWrapper src={AppUrls.FBERGER_WEBSITE} />}>
                    <LinkWrapper
                        href={AppUrls.FBERGER_WEBSITE}
                        target="_blank"
                        className="underline decoration-milk-200 underline-offset-2 cursor-alias hover:underline hover:text-aquamarine"
                    >
                        fberger
                    </LinkWrapper>
                </StyledTooltip>
            </p>
        </div>
    )
}

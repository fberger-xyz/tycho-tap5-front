'use client'

import { CHAINS_CONFIG } from '@/config/chains.config'
import { shortenValue } from '@/utils'
import StyledTooltip from './StyledTooltip'
import IconWrapper from '../icons/IconWrapper'
import { IconIds } from '@/enums'
import LinkWrapper from './LinkWrapper'

export function LinkToExplorer(props: { chainId: number; txHash: string; className?: string; children?: React.ReactNode }) {
    return (
        <StyledTooltip
            disableAnimation={true}
            content={
                <LinkWrapper
                    href={`${CHAINS_CONFIG[props.chainId] ? `${CHAINS_CONFIG[props.chainId]?.explorerRoot}/tx/${props.txHash}` : ''}`}
                    target="_blank"
                    className="flex cursor-alias items-center gap-2 hover:underline"
                >
                    <p>{CHAINS_CONFIG[props.chainId] ? `${CHAINS_CONFIG[props.chainId]?.explorerRoot}/tx/${shortenValue(props.txHash)}` : ''}</p>
                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4 text-milk" />
                </LinkWrapper>
            }
        >
            <LinkWrapper
                href={`${CHAINS_CONFIG[props.chainId] ? `${CHAINS_CONFIG[props.chainId]?.explorerRoot}/tx/${props.txHash}` : ''}`}
                target="_blank"
                className="cursor-alias hover:underline"
            >
                {props.children}
            </LinkWrapper>
        </StyledTooltip>
    )
}

'use client'

import { cn } from '@/utils'
import LinkWrapper from '../common/LinkWrapper'
import Image from 'next/image'
import { AppUrls, FileIds, IconIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import GridDropdownButton from './GridDropdownButton'
import { ButtonDark } from '../figma/Button'
import StyledTooltip from '../common/StyledTooltip'

export default function HeaderDesktop(props: { className?: string }) {
    return (
        <header className={cn('hidden md:grid grid-cols-2 items-center w-full px-4 py-4', props.className)}>
            <div className="flex gap-4 items-center">
                <GridDropdownButton />
                <LinkWrapper href={AppUrls.STRATEGIES} className="cursor-pointer">
                    <Image src={FileIds.APP_LOGO_DOUBLE_M} alt={FileIds.APP_LOGO_DOUBLE_M} width={152} height={24} />
                </LinkWrapper>
            </div>
            <div className="flex z-20 items-center justify-end gap-6">
                <LinkWrapper
                    href={AppUrls.DOCUMENTATION}
                    target="_blank"
                    className="flex items-center gap-1 px-2.5 cursor-alias w-max hover:underline ml-4" // mr-6
                >
                    <p className="text-milk text-sm truncate">Docs (Run locally)</p>
                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4" />
                </LinkWrapper>
                <StyledTooltip content="Coming soon: Create a new strategy">
                    <ButtonDark
                        onClick={() => {
                            alert('new strategy')
                        }}
                        className="px-4 py-[7px] rounded-2xl"
                    >
                        <p className="truncate text-sm">New strategy</p>
                    </ButtonDark>
                </StyledTooltip>
            </div>
        </header>
    )
}

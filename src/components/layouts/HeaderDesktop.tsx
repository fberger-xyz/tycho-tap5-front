'use client'

import { AppUrls, FileIds, IconIds } from '@/enums'
import { cn } from '@/utils'
import Image from 'next/image'
import LinkWrapper from '../common/LinkWrapper'
import StyledTooltip from '../common/StyledTooltip'
import { ButtonDark } from '../figma/Button'
import IconWrapper from '../icons/IconWrapper'
import GridDropdownButton from './GridDropdownButton'

export default function HeaderDesktop(props: { className?: string }) {
    return (
        <header className={cn('hidden w-full grid-cols-2 items-center px-4 py-4 md:grid', props.className)}>
            <div className="flex items-center gap-4">
                <GridDropdownButton />
                <LinkWrapper href={AppUrls.STRATEGIES} className="cursor-pointer">
                    <Image src={FileIds.APP_LOGO_DOUBLE_M} alt={FileIds.APP_LOGO_DOUBLE_M} width={152} height={24} />
                </LinkWrapper>
            </div>
            <div className="z-20 flex items-center justify-end gap-6">
                <LinkWrapper
                    href={AppUrls.DOCUMENTATION}
                    target="_blank"
                    className="ml-4 flex w-max cursor-alias items-center gap-1 px-2.5 hover:underline" // mr-6
                >
                    <p className="truncate text-sm text-milk">Docs</p>
                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4" />
                </LinkWrapper>
                <StyledTooltip content="Coming soon: Create a new strategy">
                    <ButtonDark
                        onClick={() => {
                            alert('new strategy')
                        }}
                        className="rounded-2xl px-4 py-[7px]"
                    >
                        <p className="truncate text-sm">New strategy</p>
                    </ButtonDark>
                </StyledTooltip>
            </div>
        </header>
    )
}

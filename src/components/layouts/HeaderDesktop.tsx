'use client'

import { cn } from '@/utils'
import LinkWrapper from '../common/LinkWrapper'
import Image from 'next/image'
import { AppUrls, FileIds, IconIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import GridDropdownButton from './GridDropdownButton'
import { ButtonDark } from '../figma/Button'

export default function HeaderDesktop(props: { className?: string }) {
    return (
        <header className={cn('hidden lg:grid grid-cols-2 items-center w-full px-8 py-6', props.className)}>
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
                <ButtonDark
                    onClick={() => {
                        alert('new strategy')
                    }}
                >
                    <p className="truncate text-sm">New strategy</p>
                </ButtonDark>
            </div>
        </header>
    )
}

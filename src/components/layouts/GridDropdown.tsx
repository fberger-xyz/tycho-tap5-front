'use client'

import { cn } from '@/utils'
import { SITE_NAME } from '@/config/app.config'
import { AppUrls, IconIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import LinkWrapper from '../common/LinkWrapper'

interface GridDropdownProps {
    isOpen: boolean
    onClose: () => void
    className?: string
}

export default function GridDropdown({ isOpen, onClose, className }: GridDropdownProps) {
    return (
        <div
            className={cn(
                `absolute left-0 mt-2 w-52 rounded-2xl backdrop-blur-lg bg-milk-200/4 border-milk-150 border-2 shadow-lg p-2 transition-all origin-top-left flex flex-col items-start z-10 gap-1`,
                {
                    'scale-100 opacity-100': isOpen,
                    'scale-95 opacity-0 pointer-events-none': !isOpen,
                },
                className,
            )}
        >
            <div className="cursor-not-allowed p-2.5 w-full rounded-xl flex justify-between items-center">
                <p className="text-sm text-gray-500 text-left">Explorer</p>
                <p className="bg-milk-100 px-1 font-semibold rounded-sm text-xs text-background">SOON</p>
            </div>
            <LinkWrapper
                href={AppUrls.ORDERBOOK}
                target="_blank"
                className="hover:bg-milk-100 p-2.5 w-full rounded-xl flex justify-between items-center group"
            >
                <p className="text-sm text-milk text-left">Orderbook</p>
                <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4 hidden group-hover:flex text-milk" />
            </LinkWrapper>
            <div onClick={onClose} className="bg-milk-100 p-2.5 w-full rounded-xl">
                <p className="text-sm text-milk text-left">{SITE_NAME.replace('Tycho ', '')}</p>
            </div>
        </div>
    )
}

'use client'

import { cn } from '@/utils'
import { SITE_NAME } from '@/config/app.config'
import { AppUrls, IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'
import LinkWrapper from '@/components/common/LinkWrapper'

interface GridDropdownProps {
    isOpen: boolean
    onClose: () => void
    className?: string
}

export default function GridDropdown({ isOpen, onClose, className }: GridDropdownProps) {
    return (
        <div
            className={cn(
                `bg-milk-200/4 absolute left-0 top-full z-50 mt-2 flex w-52 origin-top-left flex-col items-start gap-1 rounded-2xl border-2 border-milk-150 p-2 shadow-lg backdrop-blur-lg transition-all`,
                {
                    'scale-100 opacity-100': isOpen,
                    'pointer-events-none scale-95 opacity-0': !isOpen,
                },
                className,
            )}
        >
            <div className="flex w-full cursor-not-allowed items-center justify-between rounded-xl p-2.5">
                <p className="text-left text-sm text-gray-500">Explorer</p>
                <p className="rounded-sm bg-milk-100 px-1 text-xs font-semibold text-background">SOON</p>
            </div>
            <LinkWrapper
                href={AppUrls.ORDERBOOK}
                target="_blank"
                className="group flex w-full items-center justify-between rounded-xl p-2.5 hover:bg-milk-100"
            >
                <p className="text-left text-sm text-milk">Orderbook</p>
                <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="hidden size-4 text-milk group-hover:flex" />
            </LinkWrapper>
            <div onClick={onClose} className="w-full rounded-xl bg-milk-100 p-2.5">
                <p className="text-left text-sm text-milk">{SITE_NAME.replace('Tycho ', '')}</p>
            </div>
        </div>
    )
}

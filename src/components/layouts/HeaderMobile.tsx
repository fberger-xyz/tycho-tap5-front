'use client'

import { APP_PAGES } from '@/config/app.config'
import { useAppStore } from '@/stores/app.store'
import { cn, isCurrentPath } from '@/utils'
import { useRef, Suspense } from 'react'
import { useKeyboardShortcut } from '@/hooks/helpers/useKeyboardShortcutArgs'
import Image from 'next/image'
import { AppUrls, IconIds, FileIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import LinkWrapper from '../common/LinkWrapper'
import { usePathname } from 'next/navigation'
import GridDropdownButton from './GridDropdownButton'

export default function HeaderMobile() {
    const { showMobileMenu, setShowMobileMenu } = useAppStore()

    const pathname = usePathname()

    // menu
    const menuDropdown = useRef<HTMLButtonElement>(null)
    useKeyboardShortcut({ key: 'Escape', onKeyPressed: () => setShowMobileMenu(false) })

    return (
        <div className={cn('flex justify-center z-50 w-full', { 'fixed top-0': showMobileMenu })}>
            <div className="w-full lg:hidden flex justify-between px-5 py-4 ">
                {/* left */}
                <div className="flex gap-4 items-center z-30">
                    <GridDropdownButton />

                    {/* logo */}
                    {/* <Image src={FileIds.APP_LOGO_MOBILE_WINTERCUTE} alt={FileIds.APP_LOGO_MOBILE_WINTERCUTE} width={160} height={24} /> */}
                    {/* <Image src={FileIds.APP_LOGO_MOBILE_TYCHO} alt={FileIds.APP_LOGO_MOBILE_TYCHO} width={160} height={24} /> */}
                    <Image src={FileIds.APP_LOGO_DOUBLE_M} alt={FileIds.APP_LOGO_DOUBLE_M} width={151} height={24} />
                </div>

                {/* right */}
                <div className="flex gap-2 z-30">
                    {/* menu */}
                    <button
                        ref={menuDropdown}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="flex items-center gap-1 bg-milk-100 transition-colors duration-300 hover:bg-milk-100 rounded-xl h-10 px-3"
                    >
                        <IconWrapper id={showMobileMenu ? IconIds.CLOSE : IconIds.MENU} className="size-5" />
                    </button>
                </div>

                {showMobileMenu && (
                    <div
                        className="fixed z-20 inset-0 flex size-full items-center justify-center px-4 backdrop-blur-xl bg-background/40"
                        onClick={(e) => {
                            // to improve later
                            if (e.target === e.currentTarget) {
                                setShowMobileMenu(false)
                            }
                        }}
                    >
                        <Suspense
                            fallback={
                                <nav className="absolute inset-2 z-30 flex items-center justify-center h-fit flex-col gap-2 pt-28">
                                    {[1, 2, 3].map((index) => (
                                        <div key={index}>
                                            <p className="text-base p-2.5 skeleton-loading text-transparent">----------------------</p>
                                        </div>
                                    ))}
                                </nav>
                            }
                        >
                            <nav className="absolute inset-2 z-30 flex items-center justify-center h-fit flex-col gap-4 pt-28">
                                {APP_PAGES.map((page) => (
                                    <LinkWrapper
                                        key={page.path}
                                        href={page.path}
                                        className={cn('rounded-lg', { 'bg-milk-100': isCurrentPath(pathname, page.path) })}
                                    >
                                        <p className={cn('text-base text-milk px-2.5 py-2 hover:bg-milk-100/5 rounded-xl cursor-pointer')}>
                                            {page.name}
                                        </p>
                                    </LinkWrapper>
                                ))}
                                <LinkWrapper href={AppUrls.DOCUMENTATION} target="_blank" className="flex items-center gap-1 cursor-alias p-2.5">
                                    <p className="text-base">Docs (Run locally)</p>
                                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4" />
                                </LinkWrapper>
                            </nav>
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    )
}

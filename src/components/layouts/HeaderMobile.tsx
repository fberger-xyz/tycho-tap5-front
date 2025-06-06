'use client'

import { APP_METADATA, APP_PAGES } from '@/config/app.config'
import { useAppStore } from '@/stores/app.store'
import { cn, isCurrentPath } from '@/utils'
import { useRef, Suspense } from 'react'
import { IconIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import LinkWrapper from '../common/LinkWrapper'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcutArgs'
import ThemeSwitcher from './ThemeSwitcher'
import { usePathname } from 'next/navigation'

export default function HeaderMobile() {
    const { showMobileMenu, setShowMobileMenu } = useAppStore()
    const pathname = usePathname()

    // menu
    const menuDropdown = useRef<HTMLButtonElement>(null)
    useKeyboardShortcut({ key: 'Escape', onKeyPressed: () => setShowMobileMenu(false) })

    return (
        <header className={cn('flex justify-center z-50 w-full', { 'fixed top-0': showMobileMenu })}>
            <div className="w-full lg:hidden flex justify-between px-5 pt-4 ">
                {/* left */}
                <div className="ml-2 flex gap-4 items-center z-30">
                    {/* logo */}
                    <p className="text-lg font-light tracking-wider">{APP_METADATA.SITE_NAME}</p>
                </div>

                {/* right */}
                <div className="flex gap-2 z-30">
                    {/* menu */}
                    <button
                        ref={menuDropdown}
                        aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className={cn('flex items-center gap-1 transition-colors duration-300 rounded-xl py-2 px-3 hover:bg-default/10', {
                            'bg-default/5': showMobileMenu,
                        })}
                    >
                        <IconWrapper id={showMobileMenu ? IconIds.CLOSE : IconIds.MENU} className="size-8" />
                    </button>
                </div>

                {showMobileMenu && (
                    <div
                        className="fixed z-20 inset-0 flex size-full items-center justify-center px-4 backdrop-blur-xl bg-default/5"
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
                            <nav className="absolute inset-2 z-30 flex items-center justify-center h-fit flex-col gap-4 pt-28 mx-auto w-fit text-xl">
                                {/* theme */}
                                <ThemeSwitcher buttonClassName="py-4 px-7 rounded-xl" iconClassName="size-7" />

                                {/* internal */}
                                {APP_PAGES.map((page) => (
                                    <LinkWrapper
                                        key={page.path}
                                        href={page.path}
                                        className={cn('w-full p-4 hover:bg-default/10 rounded-xl cursor-pointer flex justify-center', {
                                            'bg-default/10 cursor-text': isCurrentPath(pathname, page.path),
                                            'bg-default/5 opacity-40 hover:opacity-100': !isCurrentPath(pathname, page.path),
                                        })}
                                    >
                                        <p>{page.name}</p>
                                    </LinkWrapper>
                                ))}

                                {/* external */}
                                {/* links todo */}
                            </nav>
                        </Suspense>
                    </div>
                )}
            </div>
        </header>
    )
}

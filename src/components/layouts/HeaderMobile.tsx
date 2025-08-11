'use client'

import { useAppStore } from '@/stores/app.store'
import { cn } from '@/utils'
import { useRef, useEffect } from 'react'
import { useKeyboardShortcut } from '@/hooks/helpers/useKeyboardShortcutArgs'
import Image from 'next/image'
import { AppUrls, IconIds, FileIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import LinkWrapper from '../common/LinkWrapper'
import GridDropdownButton from './GridDropdownButton'
import { AnimatePresence, motion } from 'framer-motion'
import Authors from './Authors'
import { ButtonDark } from '../figma/Button'
import { APP_PAGES } from '@/config/app.config'

export default function HeaderMobile() {
    const { showMobileMenu, setShowMobileMenu } = useAppStore()

    // menu
    const menuDropdown = useRef<HTMLButtonElement>(null)
    useKeyboardShortcut({ key: 'Escape', onKeyPressed: () => setShowMobileMenu(false) })

    // Lock body scroll when menu is open
    useEffect(() => {
        if (showMobileMenu) {
            const scrollY = window.scrollY
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollY}px`
            document.body.style.width = '100%'

            return () => {
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.width = ''
                window.scrollTo(0, scrollY)
            }
        }
    }, [showMobileMenu])

    return (
        <div className="flex justify-center z-50 w-full">
            <div className="w-full lg:hidden flex justify-between px-5 py-4 ">
                {/* left */}
                <div className="flex gap-4 items-center z-30">
                    <GridDropdownButton />

                    {/* logo */}
                    <LinkWrapper href={AppUrls.STRATEGIES} className="cursor-pointer">
                        <Image src={FileIds.APP_LOGO_DOUBLE_M} alt={FileIds.APP_LOGO_DOUBLE_M} width={151} height={24} />
                    </LinkWrapper>
                </div>

                {/* right */}
                <div className={cn('flex gap-2', showMobileMenu ? 'z-40' : 'z-30')}>
                    {/* menu */}
                    <ButtonDark
                        ref={menuDropdown}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="flex items-center gap-1 bg-milk-100 transition-colors duration-300 hover:bg-milk-100 rounded-xl px-[7px] py-1"
                    >
                        <IconWrapper id={showMobileMenu ? IconIds.CLOSE : IconIds.MENU} className="size-5" />
                    </ButtonDark>
                </div>
            </div>

            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed md:hidden z-20 inset-0 flex w-full items-center justify-center px-4 backdrop-blur-xl bg-background/40 h-[calc(100vh-0px)]"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowMobileMenu(false)
                            }
                        }}
                    >
                        <motion.nav
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                            className="absolute inset-2 z-30 flex items-center justify-center h-fit flex-col gap-4 pt-28"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 * APP_PAGES.length }}
                            >
                                <LinkWrapper
                                    href={AppUrls.DOCUMENTATION}
                                    target="_blank"
                                    className="flex items-center gap-1 cursor-alias p-2.5 group"
                                >
                                    <p className="text-base group-hover:underline">Docs (Run locally)</p>
                                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4" />
                                </LinkWrapper>
                            </motion.div>
                        </motion.nav>

                        {/* Authors - at bottom */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 * (APP_PAGES.length + 1) }}
                            className="absolute bottom-32 text-center max-w-[300px]"
                        >
                            <Authors className="text-sm text-milk-200 mx-auto justify-center" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

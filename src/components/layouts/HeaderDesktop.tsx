'use client'

import { cn } from '@/utils'
import { APP_PAGES } from '@/config/app.config'
import ThemeSwitcher from './ThemeSwitcher'
import LinkWrapper from '../common/LinkWrapper'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import Image from 'next/image'
import { AppUrls, FileIds, IconIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'

export default function HeaderDesktop(props: { className?: string }) {
    const pathname = usePathname()

    const [openGridDropdown, setOpenGridDropdown] = useState(false)
    const gridDropown = useRef<HTMLButtonElement>(null)
    useClickOutside(gridDropown, () => setOpenGridDropdown(false))

    return (
        <header className={cn('hidden lg:grid grid-cols-3 items-center w-full px-4 py-4', props.className)}>
            {/* left */}
            <div className="flex gap-4 items-center">
                {/* grid */}
                <button ref={gridDropown} onClick={() => setOpenGridDropdown(!openGridDropdown)} className="relative">
                    <div className="bg-milk-100 p-2.5 rounded-xl">
                        <Image src={'/figma/dots-grid.svg'} alt="dots-grid" width={16} height={16} className="min-w-4" />
                    </div>

                    {/* grid dropdown */}
                    <div
                        className={cn(
                            `absolute left-0 mt-2 w-52 rounded-2xl backdrop-blur-lg bg-milk-200/4 border-milk-150 border-2 shadow-lg p-2 transition-all origin-top-left flex flex-col items-start z-10 gap-1`,
                            {
                                'scale-100 opacity-100': openGridDropdown,
                                'scale-95 opacity-0 pointer-events-none': !openGridDropdown,
                            },
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
                            <IconWrapper id={IconIds.OPEN_LINK_IN_NEW_TAB} className="size-4 hidden group-hover:flex text-milk" />
                        </LinkWrapper>
                        <div onClick={() => setOpenGridDropdown(false)} className="bg-milk-100 p-2.5 w-full rounded-xl">
                            <p className="text-sm text-milk text-left">Market Maker</p>
                        </div>
                    </div>
                </button>

                {/* logo */}
                <Image src={'/figma/tycho-mm-logo.svg'} alt={FileIds.APP_LOGO} width={240} height={24} className="block" />
            </div>

            {/* middle */}
            <div className="flex gap-2 items-center mx-auto">
                {APP_PAGES.map((page) => (
                    <LinkWrapper
                        key={page.path}
                        href={page.path}
                        className={cn('flex items-center gap-1 transition-colors duration-300 rounded-xl h-9 px-3', {
                            'hover:bg-milk-100 cursor-pointer': pathname !== page.path,
                            'bg-milk-100 cursor-text': pathname === page.path,
                        })}
                    >
                        <p className="text-sm text-milk">{page.name}</p>
                    </LinkWrapper>
                ))}
            </div>

            {/* right */}
            <div className="flex z-20 items-center justify-end">
                {/* docs */}
                <LinkWrapper
                    href={AppUrls.DOCUMENTATION}
                    target="_blank"
                    className="flex items-center gap-1 px-2.5 cursor-alias w-max hover:underline ml-4 mr-6"
                >
                    <p className="text-milk text-sm truncate">Docs (Run locally)</p>
                    <IconWrapper id={IconIds.OPEN_LINK_IN_NEW_TAB} className="size-4" />
                </LinkWrapper>

                <ThemeSwitcher />
            </div>
        </header>
    )
}

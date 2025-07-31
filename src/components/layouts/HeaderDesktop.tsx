'use client'

import { cn } from '@/utils'
import { APP_PAGES } from '@/config/app.config'
// import ThemeSwitcher from './ThemeSwitcher'
import LinkWrapper from '../common/LinkWrapper'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { AppUrls, FileIds, IconIds } from '@/enums'
import IconWrapper from '../icons/IconWrapper'
import GridDropdownButton from './GridDropdownButton'

export default function HeaderDesktop(props: { className?: string }) {
    const pathname = usePathname()
    const isStrategyPage = pathname.includes('/strategies/')

    return (
        <header className={cn('hidden md:grid grid-cols-3 items-center w-full px-4 py-4', props.className)}>
            <div className="flex gap-4 items-center">
                <GridDropdownButton />
                <Image src={FileIds.APP_LOGO_DOUBLE_M} alt={FileIds.APP_LOGO_DOUBLE_M} width={152} height={24} />
            </div>
            <div className="flex gap-2 items-center mx-auto">
                {APP_PAGES.map((page) => (
                    <LinkWrapper
                        key={page.path}
                        href={page.path}
                        className={cn('flex items-center gap-1 transition-colors duration-300 rounded-xl h-9 px-3 cursor-pointer', {
                            'hover:bg-milk-100': pathname !== page.path || !(isStrategyPage && page.path === AppUrls.STRATEGIES),
                            'bg-milk-100': pathname === page.path || (isStrategyPage && page.path === AppUrls.STRATEGIES),
                        })}
                    >
                        <p className="text-sm text-milk">{page.name}</p>
                    </LinkWrapper>
                ))}
            </div>
            <div className="flex z-20 items-center justify-end">
                <LinkWrapper
                    href={AppUrls.DOCUMENTATION}
                    target="_blank"
                    className="flex items-center gap-1 px-2.5 cursor-alias w-max hover:underline ml-4" // mr-6
                >
                    <p className="text-milk text-sm truncate">Docs (Run locally)</p>
                    <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4" />
                </LinkWrapper>
            </div>
        </header>
    )
}

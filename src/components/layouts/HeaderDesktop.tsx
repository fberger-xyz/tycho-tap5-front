'use client'

import { cn } from '@/utils'
import { APP_METADATA, APP_PAGES } from '@/config/app.config'
import ThemeSwitcher from './ThemeSwitcher'
import LinkWrapper from '../common/LinkWrapper'
import { usePathname } from 'next/navigation'

export default function HeaderDesktop(props: { className?: string }) {
    const pathname = usePathname()
    return (
        <header className={cn('hidden lg:grid grid-cols-3 items-center w-full px-4 py-4', props.className)}>
            {/* left */}
            <div className="ml-2 flex gap-4 items-center">
                <p className="text-sm">{APP_METADATA.SITE_NAME}</p>
            </div>

            {/* middle */}
            <div className="flex items-center justify-center gap-2">
                {APP_PAGES.map((page) => (
                    <LinkWrapper
                        key={page.path}
                        href={page.path}
                        className={cn('flex items-center gap-1 transition-all duration-300 ease-in-out rounded-xl h-10 px-3', {
                            'bg-default/5 opacity-40 hover:opacity-100 cursor-pointer': pathname !== page.path,
                            'bg-default/10 cursor-text': pathname === page.path,
                        })}
                    >
                        <p className="text-sm text-milk">{page.name}</p>
                    </LinkWrapper>
                ))}
            </div>

            {/* right */}
            <div className="flex z-20 items-center justify-end">
                <ThemeSwitcher />
            </div>
        </header>
    )
}

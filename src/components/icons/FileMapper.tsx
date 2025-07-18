import { FileIds } from '@/enums'
import { cn } from '@/utils'
import { ReactNode } from 'react'
import DarkThemeSVG from './svgs/DarkThemeSVG'
import LightThemeSVG from './svgs/LightThemeSVG'

export function FileWrapper(props: { children: ReactNode; className?: string }) {
    return <div className={cn('flex items-center justify-center relative', props.className)}>{props.children}</div>
}

export default function FileMapper({
    className = 'size-5',
    // sizes = '20px',
    ...props
}: {
    id?: FileIds | string
    sizes?: string
    className?: string
}) {
    // theme
    if (props.id === FileIds.THEME_LIGHT) return <LightThemeSVG className={className} />
    if (props.id === FileIds.THEME_DARK) return <DarkThemeSVG className={className} />

    // fallback
    return <div className={cn('bg-milk rounded-full', className)} />
}

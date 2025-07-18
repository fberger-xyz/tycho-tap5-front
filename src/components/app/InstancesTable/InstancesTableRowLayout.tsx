'use client'

import { cn } from '@/utils'
import { ReactNode } from 'react'

/**
 * Main table row container with consistent grid layout
 */

export function InstanceRowLayout({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
    return (
        <div className={cn('w-full px-2 grid grid-cols-12 items-center gap-2', className)} onClick={onClick}>
            {children}
        </div>
    )
}

/**
 * Pair section (Chain, Base, Quote)
 */

export function ChainAndPairSection({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('col-span-2 grid h-full grid-cols-2 items-center gap-2', className)}>{children}</div>
}

/**
 * Config section (ID, Created At)
 */

export function ConfigSection({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('col-span-3 grid h-full grid-cols-2 items-center gap-2', className)}>{children}</div>
}

/**
 * Instance Details section (ID, Created At, Started At, Running Time, Status, Ended At, Trade Count, Prices Count)
 */

export function InstanceDetailsSection({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('col-span-7 grid h-full grid-cols-7 items-center gap-2', className)}>{children}</div>
}

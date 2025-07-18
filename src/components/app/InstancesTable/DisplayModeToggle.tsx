'use client'

import { memo } from 'react'
import { cn } from '@/utils'
import { useAppStore } from '@/stores/app.store'
import { InstanceDisplayMode, IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'

export const DisplayModeToggle = memo(function DisplayModeToggle({ className }: { className?: string }) {
    const { instanceDisplayMode, setInstanceDisplayMode } = useAppStore()

    return (
        <div className={cn('flex items-center gap-1 p-1 bg-milk-100 rounded-lg', className)}>
            <button
                onClick={() => setInstanceDisplayMode(InstanceDisplayMode.LIST)}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    instanceDisplayMode === InstanceDisplayMode.LIST ? 'text-milk shadow-sm' : 'text-milk/60 hover:text-milk',
                )}
            >
                <IconWrapper id={IconIds.LIST} className="size-3.5" />
                List
            </button>
            <button
                onClick={() => setInstanceDisplayMode(InstanceDisplayMode.GROUPED)}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    instanceDisplayMode === InstanceDisplayMode.GROUPED ? 'text-milk shadow-sm' : 'text-milk/60 hover:text-milk',
                )}
            >
                <IconWrapper id={IconIds.OVERFLOW_MENU_VERTICAL} className="size-3.5" />
                Grouped
            </button>
        </div>
    )
})

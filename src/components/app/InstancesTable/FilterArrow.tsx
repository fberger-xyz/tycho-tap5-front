'use client'

import React from 'react'
import { cn } from '@/utils'
import { useAppStore } from '@/stores/app.store'
import { SupportedFilters, SupportedFilterDirections, IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'

interface FilterArrowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    filter: SupportedFilters
}

export const FilterArrow: React.FC<FilterArrowProps> = ({ filter, children, className, ...props }) => {
    const { instancesSortedBy, instancesSortedByFilterDirection, sortInstancesBy, toggleFilterDirection } = useAppStore()

    return (
        <button
            {...props}
            className={cn('cursor-pointer flex items-center gap-0', className)}
            onClick={() => {
                if (instancesSortedBy === filter) toggleFilterDirection()
                else sortInstancesBy(filter)
            }}
        >
            {children}
            <div className="flex flex-col">
                <IconWrapper
                    id={IconIds.TRIANGLE_UP}
                    className={cn('size-5 opacity-30', {
                        'text-milk opacity-100':
                            instancesSortedBy === filter && instancesSortedByFilterDirection === SupportedFilterDirections.ASCENDING,
                    })}
                />
                <IconWrapper
                    id={IconIds.TRIANGLE_DOWN}
                    className={cn('size-5 -mt-[14px] opacity-30', {
                        'text-milk opacity-100':
                            instancesSortedBy === filter && instancesSortedByFilterDirection === SupportedFilterDirections.DESCENDING,
                    })}
                />
            </div>
        </button>
    )
}

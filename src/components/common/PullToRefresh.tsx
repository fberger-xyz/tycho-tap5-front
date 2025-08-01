'use client'

import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { cn } from '@/utils'
import { ReactNode } from 'react'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums/icons.enum'

interface PullToRefreshProps {
    children: ReactNode
    onRefresh: () => Promise<void>
    className?: string
}

export default function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
    const { isPulling, pullDistance, isRefreshing, isReady } = usePullToRefresh({
        onRefresh,
        threshold: 60,
        resistance: 2.5,
    })

    return (
        <>
            {/* Pull indicator - Fixed positioned to avoid clipping */}
            {(isPulling || isRefreshing) && (
                <div
                    className="fixed left-0 right-0 top-0 z-50 flex items-end justify-center pointer-events-none"
                    style={{
                        height: `${Math.max(pullDistance, 60)}px`,
                        transform: `translateY(-${Math.max(60 - pullDistance, 0)}px)`,
                        transition: isRefreshing ? 'transform 0.3s ease-out' : 'none',
                    }}
                >
                    <div className="mb-3">
                        {isRefreshing ? (
                            <div className="size-10 animate-spin rounded-full border-2 border-aquamarine border-t-transparent" />
                        ) : (
                            <div
                                className={cn(
                                    'size-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                                    isReady ? 'border-aquamarine bg-aquamarine/20' : 'border-milk-300 bg-milk-100',
                                )}
                                style={{
                                    transform: `rotate(${Math.min(pullDistance * 2, 180)}deg) scale(${Math.min(pullDistance / 60, 1)})`,
                                }}
                            >
                                <IconWrapper
                                    id={IconIds.REFRESH}
                                    className={cn('size-6', isReady ? 'text-aquamarine' : 'text-milk-400')}
                                    style={{
                                        transform: `rotate(${-Math.min(pullDistance * 2, 180)}deg)`,
                                    }}
                                />
                            </div>
                        )}
                        <p className="text-xs text-aquamarine mt-2">Reload</p>
                    </div>
                </div>
            )}

            {/* Content wrapper */}
            <div
                className={cn('relative flex flex-col min-h-screen', className)}
                style={{
                    transform: isPulling || isRefreshing ? `translateY(${pullDistance}px)` : 'translateY(0)',
                    transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {children}
            </div>
        </>
    )
}

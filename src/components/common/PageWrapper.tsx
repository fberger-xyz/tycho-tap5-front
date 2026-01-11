import { cn } from '@/utils'
import { Suspense } from 'react'
import { DefaultFallbackContent } from '@/components/layouts/DefaultFallback'
import { DEFAULT_PADDING_X } from '@/config/theme.config'

export default function PageWrapper({
    children,
    className,
    paddingX = DEFAULT_PADDING_X,
    ...props
}: {
    children: React.ReactNode
    className?: string
    paddingX?: string
}) {
    return (
        <Suspense fallback={DefaultFallbackContent()}>
            <div
                {...props}
                className={cn(
                    'mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-[980px] flex-col overflow-x-hidden overflow-y-scroll pb-4 pt-10',
                    paddingX,
                    className,
                )}
            >
                {children}
            </div>
        </Suspense>
    )
}

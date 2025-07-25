import { cn } from '@/utils'
import { Suspense } from 'react'
import { DefaultFallbackContent } from '../layouts/DefaultFallback'

export default function PageWrapper({ children, className, ...props }: { children: React.ReactNode; className?: string; showQuote?: boolean }) {
    const commonClassName =
        'mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-screen flex-col px-4 lg:px-10 items-center gap-4 overflow-x-hidden overflow-y-scroll pb-4 mt-10'
    return (
        <Suspense fallback={DefaultFallbackContent()}>
            <div {...props} className={cn(commonClassName, className)}>
                {children}
            </div>
        </Suspense>
    )
}

import { cn } from '@/utils'
import { Suspense } from 'react'
import { DefaultFallbackContent } from '../layouts/DefaultFallback'

export default function PageWrapper({ children, className, ...props }: { children: React.ReactNode; className?: string; showQuote?: boolean }) {
    const commonClassName =
        'mx-auto flex min-h-[calc(100vh-136px)] w-min max-w-[1400px] flex-col px-6 md:px-8 lg:px-10 overflow-x-hidden overflow-y-scroll pb-4 mt-10'
    return (
        <Suspense fallback={DefaultFallbackContent()}>
            <div {...props} className={cn(commonClassName, className)}>
                {children}
            </div>
        </Suspense>
    )
}

import { cn } from '@/utils'
import { Suspense } from 'react'
import { DefaultFallbackContent } from '../layouts/DefaultFallback'

export default function PageWrapper({ children, className, ...props }: { children: React.ReactNode; className?: string; showQuote?: boolean }) {
    return (
        <Suspense fallback={DefaultFallbackContent()}>
            <div
                {...props}
                className={cn(
                    'mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-[980px] flex-col px-6 md:px-8 lg:px-10 overflow-x-hidden overflow-y-scroll pb-4 mt-10',
                    className,
                )}
            >
                {children}
            </div>
        </Suspense>
    )
}

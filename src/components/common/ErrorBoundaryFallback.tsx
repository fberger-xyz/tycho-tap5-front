'use client'

import { APP_PAGES } from '@/config/app.config'
import { redirect } from 'next/navigation'

export function ErrorBoundaryFallback({ error }: { error: Error }) {
    redirect(APP_PAGES[0].path)
    return (
        <div className="flex flex-col items-center p-4 text-xs">
            <p className="">Something went wrong...</p>
            <p className="bg-very-light-hover rounded-md p-1 text-orange-400">Error: {error.message}</p>
        </div>
    )
}

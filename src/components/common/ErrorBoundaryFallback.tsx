'use client'

import { APP_PAGES } from '@/config/app.config'
import { redirect } from 'next/navigation'

export function ErrorBoundaryFallback({ error }: { error: Error }) {
    redirect(APP_PAGES[0].path)
    return (
        <div className="flex flex-col items-center text-xs p-4">
            <p className="">Something went wrong...</p>
            <p className="rounded-md bg-very-light-hover p-1 text-orange-400">Error: {error.message}</p>
        </div>
    )
}

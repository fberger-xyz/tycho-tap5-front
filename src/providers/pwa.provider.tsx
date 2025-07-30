'use client'

import { useEffect, useState } from 'react'
import PullToRefresh from '@/components/common/PullToRefresh'
import { useRouter } from 'next/navigation'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check if running on iOS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

        // Check if already installed
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            })
        }
    }, [])

    const handleRefresh = async () => {
        // Wait a bit to show the refresh animation
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Refresh the current route
        router.refresh()
    }

    // Enable pull-to-refresh in standalone PWA mode or development
    const enablePullToRefresh = isStandalone || process.env.NODE_ENV === 'development'

    const CONTENT = (
        <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
            <p className="text-xs">Install this app: tap the share button and then &quot;Add to Home Screen&quot;</p>
        </div>
    )

    if (enablePullToRefresh) {
        return (
            <PullToRefresh onRefresh={handleRefresh}>
                {children}
                {!isStandalone && isIOS && CONTENT}
            </PullToRefresh>
        )
    }

    return (
        <>
            {children}
            {!isStandalone && isIOS && CONTENT}
        </>
    )
}

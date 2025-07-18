'use client'

import { useEffect, useState } from 'react'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

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

    return (
        <>
            {children}
            {!isStandalone && isIOS && (
                <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
                    <p className="text-sm">
                        To install this app on your iOS device, tap the share button
                        <span role="img" aria-label="share icon">
                            {' '}
                            ⎋{' '}
                        </span>
                        and then &quot;Add to Home Screen&quot;
                        <span role="img" aria-label="plus icon">
                            {' '}
                            ➕{' '}
                        </span>
                    </p>
                </div>
            )}
        </>
    )
}

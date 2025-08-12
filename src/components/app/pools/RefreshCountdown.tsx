'use client'

import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { useState, useEffect } from 'react'

interface RefreshCountdownProps {
    chainId: number
    refreshIntervalMs?: number
    lastRefreshTime?: number
}

export default function RefreshCountdown({ chainId, refreshIntervalMs, lastRefreshTime }: RefreshCountdownProps) {
    // Default refresh intervals based on chain
    const defaultIntervals = {
        1: 12000, // Ethereum: 12 seconds
        8453: 5000, // Base: 5 seconds
        99999999: 5000, // Unichain: 5 seconds
    } as const

    const interval = refreshIntervalMs || defaultIntervals[chainId as keyof typeof defaultIntervals] || 5000
    const intervalInSeconds = interval / 1000

    // Track when component mounts for initial countdown
    const [mountTime] = useState(Date.now())
    const [key, setKey] = useState(0)

    // Reset timer when lastRefreshTime changes
    useEffect(() => {
        if (lastRefreshTime && lastRefreshTime > mountTime) {
            setKey((prev) => prev + 1)
        }
    }, [lastRefreshTime, mountTime])

    // Calculate initial remaining time
    const getInitialRemainingTime = () => {
        if (lastRefreshTime && lastRefreshTime > 0) {
            const elapsed = Date.now() - lastRefreshTime
            const remaining = Math.max((interval - elapsed) / 1000, 0)
            return remaining
        }
        return intervalInSeconds
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-milk-400">Refresh in</span>
            <CountdownCircleTimer
                key={key}
                isPlaying
                duration={intervalInSeconds}
                initialRemainingTime={getInitialRemainingTime()}
                colors="#00FFB4"
                trailColor="#1a1f2e"
                size={20}
                strokeWidth={2}
                trailStrokeWidth={2}
                onComplete={() => {
                    // Timer will restart automatically when data refetches
                    return { shouldRepeat: false }
                }}
            >
                {({ remainingTime }) => <span className="text-[8px] text-milk-200 font-mono">{Math.ceil(remainingTime || 0)}</span>}
            </CountdownCircleTimer>
        </div>
    )
}

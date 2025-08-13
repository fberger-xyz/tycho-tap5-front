'use client'

import { useEffect, useState, useRef } from 'react'
import { CHAINS_CONFIG } from '@/config/chains.config'

interface UseEthBalanceParams {
    walletAddress?: string
    chainId?: number
}

export function useEthBalance({ walletAddress, chainId }: UseEthBalanceParams) {
    const [balance, setBalance] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isMountedRef = useRef(true)

    useEffect(() => {
        // Track mounted state
        isMountedRef.current = true

        // Cleanup function
        return () => {
            isMountedRef.current = false
            // Abort any pending requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    useEffect(() => {
        if (!walletAddress || !chainId) {
            setBalance(0)
            return
        }

        const fetchBalance = async () => {
            // Abort any previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController()

            if (!isMountedRef.current) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch('/api/balances', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress,
                        tokenAddresses: [],
                        chainId,
                        includeNative: true,
                    }),
                    signal: abortControllerRef.current.signal,
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch balance')
                }

                const data = await response.json()
                const nativeBalance = data.balances?.find(
                    (b: { address: string; balance: string; decimals: number; symbol?: string }) =>
                        b.address === '0x0000000000000000000000000000000000000000',
                )

                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    if (nativeBalance) {
                        // Convert from wei to ETH
                        const ethAmount = parseFloat(nativeBalance.balance) / Math.pow(10, 18)
                        setBalance(ethAmount)
                    } else {
                        setBalance(0)
                    }
                }
            } catch (err) {
                // Ignore abort errors
                if (err instanceof Error && err.name === 'AbortError') {
                    return
                }

                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    console.error('Error fetching ETH balance:', err)
                    setError(err instanceof Error ? err : new Error('Unknown error'))
                    setBalance(0)
                }
            } finally {
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    setIsLoading(false)
                }
            }
        }

        fetchBalance()

        // Cleanup function for this effect
        return () => {
            // Abort the request if component unmounts or dependencies change
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [walletAddress, chainId])

    // Check if balance is below threshold
    const chainConfig = chainId ? CHAINS_CONFIG[chainId] : null
    const threshold = chainConfig?.showTopUpBannerIfEthBalanceBelow || 0

    return {
        balance,
        isEthBalanceLoading: isLoading,
        error,
        isEthBelowThreshold: balance < threshold,
        threshold,
    }
}

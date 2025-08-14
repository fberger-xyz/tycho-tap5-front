'use client'

import FileMapper from '@/components/icons/FileMapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { AppSupportedChainIds } from '@/enums'
import { cn } from '@/utils'
import Image from 'next/image'
import { useState } from 'react'

export function ImageWrapper({
    src,
    alt = 'missing alt',
    size,
    className = 'rounded-full',
}: {
    src?: string
    alt?: string
    size: number
    className?: string
}) {
    const [imgError, setImgError] = useState(false)
    if (!src || imgError) return <div className={cn('skeleton-loading', className)} style={{ width: size, height: size }} />
    return <Image src={src} alt={alt} width={size} height={size} className={cn('object-cover', className)} onError={() => setImgError(true)} />
}

export function ChainImage({ id, size, className = 'rounded-lg' }: { id: AppSupportedChainIds; size?: number; className?: string }) {
    const chainConfig = CHAINS_CONFIG[id]

    // Use local FileMapper if available
    if (chainConfig?.fileId) {
        return <FileMapper id={chainConfig.fileId} className={className} size={size} />
    }

    // Otherwise use 1inch image
    if (chainConfig?.oneInchId) {
        return (
            <ImageWrapper
                src={`https://app.1inch.io/assets/images/network-logos/${chainConfig.oneInchId}.svg`}
                size={size ?? 20}
                alt={`Logo of ${chainConfig.name}`}
                className={className}
            />
        )
    }

    // Fallback to skeleton if no valid chain config
    return <div className={cn('skeleton-loading', className)} style={{ width: size ?? 20, height: size ?? 20 }} />
}

export function SymbolImage(props: { symbol?: string; className?: string; size?: number }) {
    // Check for valid symbol - must be non-empty string
    const hasValidSymbol = props.symbol && props.symbol.trim().length > 0

    // Return skeleton if no valid symbol
    if (!hasValidSymbol) {
        return <div className={cn('skeleton-loading rounded-full', props.className)} style={{ width: props.size ?? 20, height: props.size ?? 20 }} />
    }

    // TypeScript knows props.symbol is defined here due to hasValidSymbol check
    const symbolLower = props.symbol!.toLowerCase().trim()

    return (
        <ImageWrapper
            src={`https://raw.githubusercontent.com/bgd-labs/web3-icons/main/icons/full/${symbolLower}.svg`}
            size={props.size ?? 20}
            alt={`Logo of ${symbolLower}`}
            className={props.className}
        />
    )
}

export function DoubleSymbol({
    size = 20,
    gap = 2,
    symbolLeft,
    symbolRight,
    className,
    marginLeft = -(size + gap) / 2,
    marginRight = -(size + gap) / 2,
}: {
    symbolLeft?: string
    symbolRight?: string
    className?: string
    size?: number
    gap?: number
    marginLeft?: number
    marginRight?: number
}) {
    return (
        <div className="relative flex items-center" style={{ width: size + gap, height: size, minWidth: size + gap }}>
            {/* Left half */}
            <div
                className={cn('absolute overflow-hidden', className)}
                style={{
                    width: (size - gap) / 2,
                    height: size,
                    left: 0,
                    clipPath: `inset(0 0 0 0)`,
                }}
            >
                <div style={{ marginRight }}>
                    <SymbolImage symbol={symbolLeft} size={size} className="rounded-full" />
                </div>
            </div>

            {/* Right half */}
            <div
                className={cn('absolute overflow-hidden', className)}
                style={{
                    width: (size - gap) / 2,
                    height: size,
                    right: 0,
                    clipPath: `inset(0 0 0 0)`,
                }}
            >
                <div style={{ marginLeft }}>
                    <SymbolImage symbol={symbolRight} size={size} className="rounded-full" />
                </div>
            </div>
        </div>
    )
}

'use client'

import { CHAINS_CONFIG } from '@/config/chains.config'
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

export function ChainImage({ id, size, className = 'rounded-lg' }: { id?: string | number; size?: number; className?: string }) {
    const src = id
        ? CHAINS_CONFIG[Number(id)]?.oneInchId
            ? `https://app.1inch.io/assets/images/network-logos/${CHAINS_CONFIG[Number(id)]?.oneInchId}.svg`
            : ''
        : ''
    const alt = `Logo of ${id ? (CHAINS_CONFIG[Number(id)]?.name ?? 'unknown') : 'unknown'}`
    return <ImageWrapper src={src} size={size ?? 20} alt={alt} className={className} />
}

export function SymbolImage(props: { symbol?: string; className?: string; size?: number }) {
    return (
        <ImageWrapper
            src={
                props.symbol ? `https://raw.githubusercontent.com/bgd-labs/web3-icons/main/icons/full/${String(props.symbol.toLowerCase())}.svg` : ''
            }
            size={props.size ?? 20}
            alt={`Logo of ${props.symbol?.toLowerCase() ?? 'unknown'}`}
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

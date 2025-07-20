'use client'

import { CHAINS_CONFIG } from '@/config/chains.config'
import { cn } from '@/utils'
import Image from 'next/image'
import { useState } from 'react'
import StyledTooltip from './StyledTooltip'

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

export function ChainImage({ id, size, className = 'rounded-full' }: { id?: string | number; size?: number; className?: string }) {
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

export function ImageWithText(props: { symbol?: string; chainId?: number; className?: string; size?: number }) {
    if (props.symbol) {
        return (
            <StyledTooltip disableAnimation={true} content={props.symbol}>
                <div className="flex items-center gap-2">
                    <SymbolImage symbol={props.symbol} size={props.size} className={cn('rounded-full', props.className)} />
                    <p>{props.symbol}</p>
                </div>
            </StyledTooltip>
        )
    } else if (props.chainId) {
        return (
            <StyledTooltip disableAnimation={true} content={CHAINS_CONFIG[Number(props.chainId)].name}>
                <div className="flex items-center gap-2">
                    <ChainImage id={props.chainId} size={props.size ?? 20} className={cn('rounded-full', props.className)} />
                    <p>{CHAINS_CONFIG[Number(props.chainId)].name}</p>
                </div>
            </StyledTooltip>
        )
    }
    return (
        <div className="flex items-center gap-2">
            <ChainImage id={props.chainId} size={props.size ?? 20} className={props.className} />
            <p>Unknown</p>
        </div>
    )
}

import { IconIds } from '@/enums'
import { cn } from '@/utils'
import IconWrapper from '../icons/IconWrapper'
import numeral from 'numeral'
import { ReactNode } from 'react'

type TagVariant = 'success' | 'default' | 'error'

const variantStyles: Record<TagVariant, { bg: string; text: string }> = {
    success: { bg: 'bg-aquamarine/20', text: 'text-aquamarine truncate' },
    default: { bg: 'bg-milk-100', text: 'text-milk-600 truncate' },
    error: { bg: 'bg-folly/20', text: 'text-folly truncate' },
}

export function Tag({ variant, children, className }: { variant: TagVariant; children: ReactNode; className?: string }) {
    const { bg } = variantStyles[variant]
    return <div className={cn('w-fit flex gap-0.5 items-center', bg, className)}>{children}</div>
}

/**
 * strategy card
 */

export function TargetSpread({ bpsAmount, rounded = 'rounded' }: { bpsAmount: number; rounded?: string }) {
    const variant = 'default'
    return (
        <Tag variant={variant} className={cn('pl-2 pr-1.5 py-0.5 text-xs h-fit', rounded)}>
            <p className={variantStyles[variant].text}>{numeral(bpsAmount).format('0,0.[0000]')} bps</p>
        </Tag>
    )
}

export function Range({ inRange, className = 'rounded' }: { inRange: boolean; className?: string }) {
    const variant = inRange ? 'success' : 'error'
    return (
        <Tag variant={variant} className={cn('pl-1.5 pr-2 py-0.5 text-xs h-fit', className)}>
            <p className={variantStyles[variant].text}>{inRange ? 'In range' : 'Out of range'}</p>
        </Tag>
    )
}

/**
 * trades list
 */

export function TradeSide({ side }: { side: 'buy' | 'sell' }) {
    const variant = side === 'buy' ? 'success' : 'error'
    return (
        <Tag variant={variant} className="rounded-xl px-2 py-0.5 text-xs h-fit">
            <p className={variantStyles[variant].text}>{side === 'buy' ? 'Buy' : 'Sell'}</p>
        </Tag>
    )
}

export function PercentEvolution({ percentage, className }: { percentage: number; className?: string }) {
    const variant = percentage > 0 ? 'success' : percentage < 0 ? 'error' : 'default'
    return (
        <Tag variant={variant} className={cn('rounded-xl px-1 py-0.5 text-xs h-fit', className)}>
            <IconWrapper
                id={percentage > 0 ? IconIds.ARROW_UP_RIGHT : percentage < 0 ? IconIds.ARROW_DOWN_LEFT : IconIds.ARROW_WAVE_RIGHT_UP}
                className={cn('size-4', variantStyles[variant].text)}
            />

            <p className={variantStyles[variant].text}>{numeral(percentage).format('0,0.[00]%')}</p>
        </Tag>
    )
}

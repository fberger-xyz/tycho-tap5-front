import { FileIds, IconIds } from '@/enums'
import { cn } from '@/utils'
import { ReactNode } from 'react'
import DarkThemeSVG from './svgs/DarkThemeSVG'
import LightThemeSVG from './svgs/LightThemeSVG'
import Image from 'next/image'
import IconWrapper from './IconWrapper'

export function FileWrapper(props: { children: ReactNode; className?: string }) {
    return <div className={cn('flex items-center justify-center relative', props.className)}>{props.children}</div>
}

export default function FileMapper({
    className = 'size-5',
    size = 20,
    ...props
}: {
    id?: FileIds | IconIds | string
    size?: number
    className?: string
}) {
    // theme
    if (props.id === FileIds.THEME_LIGHT) return <LightThemeSVG className={className} />
    if (props.id === FileIds.THEME_DARK) return <DarkThemeSVG className={className} />

    // chains
    if (props.id === FileIds.BASE)
        return (
            <div className={className}>
                <Image src={`/figma/chains/base.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )
    if (props.id === FileIds.UNICHAIN)
        return (
            <div className={className}>
                <Image src={`/figma/chains/unichain.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )

    // protocols
    if (props.id === FileIds.PROTOCOL_BALANCER)
        return (
            <div className={cn(className, 'bg-white p-0.5')}>
                <Image src={`/protocols/balancer.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )
    if (props.id === FileIds.PROTOCOL_CURVE)
        return (
            <div className={cn(className, 'bg-white p-0.5')}>
                <Image src={`/protocols/curve.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )
    if (props.id === FileIds.PROTOCOL_PANCAKESWAP)
        return (
            <div className={cn(className, 'bg-white p-0.5')}>
                <Image src={`/protocols/pancakeswap.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )
    if (props.id === FileIds.PROTOCOL_SUSHISWAP)
        return (
            <div className={cn(className, 'bg-white p-0.5')}>
                <Image src={`/protocols/sushiswap.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )
    if (props.id === FileIds.PROTOCOL_UNISWAP)
        return (
            <div className={cn(className, 'bg-white p-0.5 rounded-full')}>
                <Image src={`/protocols/uniswap.svg`} alt={`${props.id} logo`} width={size} height={size} className="w-full h-full" />
            </div>
        )

    // icon
    if (props.id && props.id in IconIds) return <IconWrapper id={props.id as IconIds} className={className} />

    // fallback
    return <div className={cn('bg-milk rounded-full', className)} />
}

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
    sizes = '20px',
    ...props
}: {
    id?: FileIds | IconIds | string
    sizes?: string
    className?: string
}) {
    // theme
    if (props.id === FileIds.THEME_LIGHT) return <LightThemeSVG className={className} />
    if (props.id === FileIds.THEME_DARK) return <DarkThemeSVG className={className} />
    if (props.id === FileIds.BASE)
        return (
            <FileWrapper className={className}>
                <Image src={`/chains/base.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={className} />
            </FileWrapper>
        )
    if (props.id === FileIds.UNICHAIN)
        return (
            <FileWrapper className={className}>
                <Image src={`/chains/unichain.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={className} />
            </FileWrapper>
        )

    // protocols
    if (props.id === FileIds.PROTOCOL_BALANCER)
        return (
            <FileWrapper className={className}>
                <Image src={`/protocols/balancer.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={cn(className, 'bg-white p-0.5')} />
            </FileWrapper>
        )
    if (props.id === FileIds.PROTOCOL_CURVE)
        return (
            <FileWrapper className={className}>
                <Image src={`/protocols/curve.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={cn(className, 'bg-white p-0.5')} />
            </FileWrapper>
        )
    if (props.id === FileIds.PROTOCOL_PANCAKESWAP)
        return (
            <FileWrapper className={className}>
                <Image src={`/protocols/pancakeswap.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={cn(className, 'bg-white p-0.5')} />
            </FileWrapper>
        )
    if (props.id === FileIds.PROTOCOL_SUSHISWAP)
        return (
            <FileWrapper className={className}>
                <Image src={`/protocols/sushiswap.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={cn(className, 'bg-white p-0.5')} />
            </FileWrapper>
        )
    if (props.id === FileIds.PROTOCOL_UNISWAP)
        return (
            <FileWrapper className={cn(className, 'rounded-full')}>
                <Image src={`/protocols/uniswap.svg`} alt={`${props.id} logo`} sizes={sizes} fill className={cn(className, 'bg-white p-0.5')} />
            </FileWrapper>
        )

    // icon
    if (props.id && props.id in IconIds) return <IconWrapper id={props.id as IconIds} className={className} />

    // fallback
    return <div className={cn('bg-milk rounded-full', className)} />
}

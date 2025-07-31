import { cn } from '@/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'chart' | 'metric'
}

export default function Skeleton({ className, variant = 'text' }: SkeletonProps) {
    const variantClasses = {
        text: 'w-1/2 h-6',
        chart: 'w-full h-14',
        metric: 'w-20 h-6',
    }

    return <div className={cn('skeleton-loading rounded-lg', variantClasses[variant], className)} />
}

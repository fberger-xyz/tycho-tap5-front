import { cn } from '@/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'chart' | 'metric'
}

export default function Skeleton({ className, variant = 'text' }: SkeletonProps) {
    const variantClasses = {
        text: 'w-2/3 h-[22px] rounded',
        chart: 'w-full h-14 rounded-lg',
        metric: 'w-20 h-6 rounded',
    }

    return <div className={cn('skeleton-loading', variantClasses[variant], className)} />
}

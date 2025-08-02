import { cn } from '@/utils'

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col gap-1 bg-milk-50 rounded-xl p-5 hover:bg-milk-100 transition-colors duration-200', className)}>
            {children}
        </div>
    )
}

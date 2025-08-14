import { cn } from '@/utils'

export default function Card({ children, className, hoverable = false }: { children: React.ReactNode; className?: string; hoverable?: boolean }) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1 rounded-xl bg-milk-50 p-5 transition-colors duration-300',
                hoverable && 'hover:bg-milk-100',
                className,
            )}
        >
            {children}
        </div>
    )
}

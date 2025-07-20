export function ChartBackground({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`rounded-lg bg-card p-4 ${className}`}>{children}</div>
}

export function LoadingArea() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="text-secondary">Loading...</div>
        </div>
    )
}

export function CustomFallback() {
    return (
        <div className="flex h-[400px] w-full items-center justify-center rounded-lg bg-card">
            <div className="text-secondary">Loading chart...</div>
        </div>
    )
}

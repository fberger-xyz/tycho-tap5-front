export function LoadingPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex h-40 items-center justify-center">
            <div className="text-milk">Loading {props.entryName}...</div>
        </div>
    )
}

export function ErrorPlaceholder(props: { entryName: string; errorMessage: string }) {
    return (
        <div className="w-full rounded-xl border border-red-200 p-4">
            <p className="text-sm font-medium text-folly">Failed to load {props.entryName}</p>
            <p className="text-xs text-milk-400">{props.errorMessage}</p>
        </div>
    )
}

export function NotFoundPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex h-20 items-center justify-center">
            <div className="text-milk-200">{props.entryName} not found</div>
        </div>
    )
}

export function EmptyPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex h-20 items-center justify-center">
            <div className="text-milk-200">No {props.entryName}</div>
        </div>
    )
}

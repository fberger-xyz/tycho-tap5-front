export function LoadingPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-40">
            <div className="text-milk">Loading {props.entryName}...</div>
        </div>
    )
}

export function ErrorPlaceholder(props: { entryName: string; errorMessage: string }) {
    return (
        <div className="w-full border border-red-200 p-4 rounded-xl">
            <p className="text-folly text-sm font-medium">Failed to load {props.entryName}</p>
            <p className="text-milk-400 text-xs">{props.errorMessage}</p>
        </div>
    )
}

export function NotFoundPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-20">
            <div className="text-milk-200">{props.entryName} not found</div>
        </div>
    )
}

export function EmptyPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-20">
            <div className="text-milk-200">No {props.entryName}</div>
        </div>
    )
}

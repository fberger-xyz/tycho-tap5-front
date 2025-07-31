export function LoadingPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-milk">Loading {props.entryName}...</div>
        </div>
    )
}

export function ErrorPlaceholder(props: { entryName: string; errorMessage: string }) {
    return (
        <div className="w-full border border-red-200 p-4 rounded-xl">
            <p className="text-red-600 text-sm font-medium">Failed to load {props.entryName}</p>
            <p className="text-red-500 text-xs">{props.errorMessage}</p>
        </div>
    )
}

export function NotFoundPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-milk">{props.entryName} not found</div>
        </div>
    )
}

export function EmptyPlaceholder(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-milk">No {props.entryName}</div>
        </div>
    )
}

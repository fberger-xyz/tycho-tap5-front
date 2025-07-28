export function LoadingTemplate(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-milk">Loading {props.entryName}...</div>
        </div>
    )
}

export function ErrorTemplate(props: { entryName: string }) {
    return (
        <div className="w-full border border-red-200 bg-red-50 p-4 rounded-xl">
            <p className="text-red-600 text-sm font-medium">Failed to load {props.entryName}</p>
        </div>
    )
}

export function NotFoundTemplate(props: { entryName: string }) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-milk">{props.entryName} not found</div>
        </div>
    )
}

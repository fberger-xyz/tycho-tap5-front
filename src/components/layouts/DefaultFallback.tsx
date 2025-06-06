import PageWrapper from '../common/PageWrapper'

export function DefaultFallbackContent() {
    return (
        <div className="size-full flex flex-col gap-10">
            <div className="grid gap-8 w-full grid-cols-2">
                <div className="skeleton-loading h-16 w-80 ml-auto" />
                <div className="skeleton-loading h-16 w-80 mr-auto" />
            </div>
            <div className="flex gap-6 flex-col">
                <div className="skeleton-loading h-10 w-60 mx-auto" />
                <div className="skeleton-loading h-80" />
            </div>
        </div>
    )
}

export default function DefaultFallback() {
    return (
        <PageWrapper>
            <DefaultFallbackContent />
        </PageWrapper>
    )
}

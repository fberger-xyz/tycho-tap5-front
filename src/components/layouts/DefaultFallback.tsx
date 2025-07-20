import PageWrapper from '../common/PageWrapper'
import { InstancesTableHeaders as TableHeaders, LoadingInstanceRows as LoadingRows } from '../app/sections/instances/InstancesTableRow'

export function DefaultFallbackContent() {
    return (
        <div className="w-full overflow-x-scroll px-4">
            <div className="flex min-w-[1200px] w-full flex-col overflow-hidden rounded-xl border border-milk-200 text-xs">
                <TableHeaders />
                <LoadingRows />
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

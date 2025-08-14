import PageWrapper from '../common/PageWrapper'
import { LoadingStrategiesList } from '../app/strategies/list/StrategiesList'
import { DEFAULT_PADDING_X } from '@/config/theme.config'
import { cn } from '@/utils'
import Card from '../figma/Card'
import Skeleton from '../common/Skeleton'
import { ListToShow } from '@/enums'

export function DefaultFallbackContent() {
    return (
        <>
            <div className="mx-auto mb-14 grid w-full max-w-[980px] grid-cols-1 gap-4 px-6 sm:grid-cols-3 md:px-8 lg:px-10">
                <Card>
                    <p className="text-sm text-milk-400">Total PnL</p>
                    <Skeleton variant="text" />
                </Card>
                <Card>
                    <p className="text-sm text-milk-400">Total AUM</p>

                    <Skeleton variant="text" />
                </Card>
                <Card>
                    <p className="text-sm text-milk-400">Total trades</p>

                    <Skeleton variant="text" />
                </Card>
            </div>

            {/* list to show */}
            <div className={cn('mx-auto mb-8 flex max-w-[980px] gap-6', DEFAULT_PADDING_X)}>
                {Object.values(ListToShow).map((list) => (
                    <button key={list}>
                        <p
                            className={cn('text-lg', {
                                'text-milk': list === ListToShow.STRATEGIES,
                                'text-milk-400': list !== ListToShow.STRATEGIES,
                            })}
                        >
                            {list}
                        </p>
                    </button>
                ))}
            </div>
            <div className={cn('mx-auto flex max-w-[980px] flex-col gap-5', DEFAULT_PADDING_X)}>
                <LoadingStrategiesList />
            </div>
        </>
    )
}

export default function DefaultFallback() {
    return (
        <PageWrapper>
            <DefaultFallbackContent />
        </PageWrapper>
    )
}

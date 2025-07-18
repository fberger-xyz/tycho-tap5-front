import { Cell } from './TableRow'
import { InstanceRowLayout, ChainAndPairSection, ConfigSection, InstanceDetailsSection } from '../shared/InstanceRowLayout'
import { COLUMN_HEADERS } from '../headers/TableHeaders'

// Skeleton loading classes
export const SKELETON_CLASSES = {
    base: 'skeleton-loading w-3/4 text-transparent',
    withSize: 'skeleton-loading my-2 h-[28px] w-3/4 text-transparent',
} as const

export function LoadingRows() {
    return (
        <div className="transition-all duration-200">
            {Array(8)
                .fill(0)
                .map((_, i) => (
                    <InstanceRowLayout key={i} className="border-b border-milk-200 border-dashed h-14">
                        <ChainAndPairSection>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.chain}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.pair}</p>
                            </Cell>
                        </ChainAndPairSection>

                        <ConfigSection>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.configurationId}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.configurationCreatedAt}</p>
                            </Cell>
                        </ConfigSection>

                        <InstanceDetailsSection>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceId}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceCreatedAt}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceStartedAt}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceRunningTime}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceStatus}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceEndedAt}</p>
                            </Cell>
                            <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instanceTradeCount}</p>
                            </Cell>
                            {/* <Cell className="skeleton-loading w-full h-3/5 text-transparent rounded-xl">
                                <p className={SKELETON_CLASSES.base}>{COLUMN_HEADERS.instancePricesCountCalled}</p>
                            </Cell> */}
                        </InstanceDetailsSection>
                    </InstanceRowLayout>
                ))}
        </div>
    )
}

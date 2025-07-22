'use client'

import { SectionLayout } from '@/components/app/sections/SectionLayout'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { InstanceTradesTable } from './InstanceTradesTable'
// import { shortenValue } from '@/utils'
import { useAppStore } from '@/stores/app.store'

const DESCRIPTION = 'Live tradebook of this instance'

export default function InstanceActivitySection({ instanceId }: { instanceId: string }) {
    const { showActivitySection, setShowActivitySection } = useAppStore()
    const debug = false
    if (debug) console.log('instanceId', instanceId)

    return (
        <SectionLayout
            title={
                <div className="w-full flex justify-between">
                    <button
                        onClick={() => setShowActivitySection(!showActivitySection)}
                        className="flex gap-1 items-center rounded-lg px-2.5 py-1.5 hover:bg-milk-100 transition-colors duration-300 -ml-1 w-fit"
                        aria-expanded={showActivitySection}
                        aria-label={`${showActivitySection ? 'Collapse' : 'Expand'} activity section`}
                    >
                        {/* <p className="text-milk font-semibold">{`${shortenValue(instanceId)} activity`}</p> */}
                        <p className="text-milk font-semibold">Tradebook</p>
                        <IconWrapper id={showActivitySection ? IconIds.TRIANGLE_UP : IconIds.TRIANGLE_DOWN} className="size-5" />
                    </button>
                </div>
            }
            content={
                showActivitySection ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-milk-400">{DESCRIPTION}</p>
                        <InstanceTradesTable instanceId={instanceId} />
                    </div>
                ) : null
            }
        />
    )
}

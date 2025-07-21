'use client'

import { SectionLayout } from '@/components/app/sections/SectionLayout'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
// import { shortenValue } from '@/utils'
import { useAppStore } from '@/stores/app.store'

export default function InventorySection({ instanceId }: { instanceId: string }) {
    const { showInventorySection, setShowInventorySection } = useAppStore()
    console.log('instanceId', instanceId)

    return (
        <SectionLayout
            title={
                <div className="w-full flex justify-between">
                    <button
                        onClick={() => setShowInventorySection(!showInventorySection)}
                        className="flex gap-1 items-center rounded-lg px-2.5 py-1.5 hover:bg-milk-100 transition-colors duration-300 -ml-1 w-fit"
                        aria-expanded={showInventorySection}
                        aria-label={`${showInventorySection ? 'Collapse' : 'Expand'} inventory section`}
                    >
                        {/* <p className="text-milk font-semibold">{`${shortenValue(instanceId)} inventory`}</p> */}
                        <p className="text-milk font-semibold">Inventory</p>
                        <IconWrapper id={showInventorySection ? IconIds.TRIANGLE_UP : IconIds.TRIANGLE_DOWN} className="size-5" />
                    </button>
                </div>
            }
            content={
                showInventorySection ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-milk-400">Inventory of this instance</p>
                    </div>
                ) : null
            }
        />
    )
}

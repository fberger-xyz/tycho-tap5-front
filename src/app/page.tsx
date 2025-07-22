'use client'

import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
// import ActivitySection from '@/components/app/sections/activity/ActivitySection'
// import InstancesSection from '@/components/app/sections/instances/InstancesSection'
import StrategiesSection from '@/components/app/strategies/StrategiesSection'

export default function Page() {
    return (
        <HydratedPageWrapper>
            <StrategiesSection />
            {/* <InstancesSection />
            <ActivitySection /> */}
        </HydratedPageWrapper>
    )
}

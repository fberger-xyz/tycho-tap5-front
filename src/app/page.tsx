'use client'

import HydratedPageWrapper from '@/components/stores/HydratedPageWrapper'
import ActivitySection from '@/components/app/sections/activity/ActivitySection'
import InstancesSection from '@/components/app/sections/instances/InstancesSection'

export default function Page() {
    return (
        <HydratedPageWrapper>
            <InstancesSection />
            <ActivitySection />
        </HydratedPageWrapper>
    )
}

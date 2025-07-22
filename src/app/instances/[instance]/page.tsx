import { notFound } from 'next/navigation'
import InstanceActivitySection from '@/components/app/instance/InstanceTraderbookSection'
import { prisma } from '@/clients/prisma'
import { EnrichedInstance } from '@/types'
import { enrichInstanceWithConfig } from '@/utils'
import CandlesSection from '@/components/app/instance/CandlesSection'
import PageWrapper from '@/components/common/PageWrapper'
import InventorySection from '@/components/app/instance/InstanceInventory'
import InstanceKPIs from '@/components/app/instance/InstanceKPIs'

async function getInstanceData(instanceId: string): Promise<EnrichedInstance> {
    const instance = await prisma.instance.findUnique({
        where: { id: instanceId },
        include: {
            Configuration: true,
            Trade: {
                orderBy: { createdAt: 'desc' },
            },
            _count: {
                select: {
                    Trade: true,
                    Price: true,
                },
            },
        },
    })

    if (!instance || !instance.Configuration) {
        notFound()
    }

    // Use the enrichInstanceWithConfig utility to get proper token symbols
    return enrichInstanceWithConfig(instance, instance.Configuration)
}

export default async function InstancePage({
    params,
}: {
    params: Promise<{
        instance: string
    }>
}) {
    const { instance: instanceId } = await params
    const enrichedInstance = await getInstanceData(instanceId)
    return (
        <PageWrapper>
            {/* <div>
                <h1 className="text-3xl font-bold text-milk-800">Instance Details</h1>
                <p className="text-milk-400 mt-1">Monitor and analyze the performance of your market maker instance</p>
            </div> */}
            <InstanceKPIs instance={enrichedInstance} />
            <CandlesSection instance={enrichedInstance} />
            <InstanceActivitySection instanceId={instanceId} />
            <InventorySection instanceId={instanceId} />
        </PageWrapper>
    )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import OneInchCandlestickChart from '@/components/charts/OneInchCandlestickChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppInstanceStatus } from '@/enums/app.enum'
import { formatDistance, format } from 'date-fns'
import { prisma } from '@/clients/prisma'

interface InstancePageProps {
    params: Promise<{
        instance: string
    }>
}

async function getInstanceData(instanceId: string) {
    const instance = await prisma.instance.findUnique({
        where: { id: instanceId },
        include: {
            Configuration: true,
            _count: {
                select: {
                    Trade: true,
                    Price: true,
                },
            },
        },
    })

    if (!instance) {
        notFound()
    }

    return instance
}

function getInstanceStatus(instance: any): AppInstanceStatus {
    if (instance.endedAt) {
        return AppInstanceStatus.STOPPED
    }
    return AppInstanceStatus.RUNNING
}

function InstanceMetrics({ instance }: { instance: any }) {
    const status = getInstanceStatus(instance)
    const runningTime = formatDistance(new Date(instance.startedAt), instance.endedAt ? new Date(instance.endedAt) : new Date(), { addSuffix: false })

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Status</CardDescription>
                </CardHeader>
                <CardContent>
                    <Badge variant={status === AppInstanceStatus.RUNNING ? 'default' : 'secondary'}>{status}</Badge>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Running Time</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{runningTime}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Total Trades</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{instance._count.Trade}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Price Updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{instance._count.Price}</p>
                </CardContent>
            </Card>
        </div>
    )
}

function InstanceConfiguration({ config, configuration }: { config: any; configuration: any }) {
    const configEntries = Object.entries(config).filter(([key]) => !['baseTokenAddress', 'quoteTokenAddress', 'chainId'].includes(key))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Created {format(new Date(configuration.createdAt), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium">Configuration ID:</div>
                        <div className="font-mono text-muted-foreground">{configuration.id}</div>

                        <div className="font-medium">Chain ID:</div>
                        <div>{configuration.chainId}</div>

                        <div className="font-medium">Base Token:</div>
                        <div className="font-mono text-xs break-all">{configuration.baseTokenAddress}</div>

                        <div className="font-medium">Quote Token:</div>
                        <div className="font-mono text-xs break-all">{configuration.quoteTokenAddress}</div>
                    </div>

                    {configEntries.length > 0 && (
                        <>
                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-medium mb-2">Parameters</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {configEntries.map(([key, value]) => (
                                        <div key={key} className="contents">
                                            <div className="font-medium">{key}:</div>
                                            <div>{JSON.stringify(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default async function InstancePage({ params }: InstancePageProps) {
    const { instance: instanceId } = await params
    const instance = await getInstanceData(instanceId)

    const baseToken = instance.Configuration?.baseTokenAddress || ''
    const quoteToken = instance.Configuration?.quoteTokenAddress || ''
    const chainId = instance.Configuration?.chainId || 1

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Instance Details</h1>
                <p className="text-muted-foreground">
                    Instance {instanceId} • Started {format(new Date(instance.startedAt), 'PPP')}
                </p>
            </div>

            <InstanceMetrics instance={instance} />

            <div className="grid gap-6 lg:grid-cols-2">
                <InstanceConfiguration config={instance.config} configuration={instance.Configuration} />

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Price Chart</CardTitle>
                        <CardDescription>
                            {baseToken.slice(0, 6)}...{baseToken.slice(-4)} / {quoteToken.slice(0, 6)}...{quoteToken.slice(-4)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px]">
                            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
                                <OneInchCandlestickChart token0={baseToken} token1={quoteToken} chainId={chainId} />
                            </Suspense>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

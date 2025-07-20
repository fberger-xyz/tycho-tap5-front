import { enrichInstanceWithConfig } from '@/utils'
import { Configuration, Instance } from '@prisma/client'

export type InstanceWithCounts = Instance & {
    _count: {
        Trade: number
        Price: number
    }
}

export type ConfigurationWithInstances = Configuration & {
    Instance: InstanceWithCounts[]
}

export type EnrichedInstance = ReturnType<typeof enrichInstanceWithConfig>

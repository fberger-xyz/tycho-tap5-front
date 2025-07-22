import { enrichInstanceWithConfig } from '@/utils'
import { Configuration, Instance, Trade } from '@prisma/client'

export type InstanceWithCounts = Instance & {
    Trade: Trade[]
    _count: {
        Trade: number
        Price: number
    }
}

export type ConfigurationWithInstances = Configuration & {
    Instance: InstanceWithCounts[]
}

export type EnrichedInstance = ReturnType<typeof enrichInstanceWithConfig>

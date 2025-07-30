import { Configuration, Instance, Trade } from '@prisma/client'

export type TradeWithInstanceAndConfiguration = Trade & {
    Instance: Instance & {
        Configuration: Configuration | null
    }
}

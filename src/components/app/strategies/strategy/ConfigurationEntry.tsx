'use client'

import { Configuration } from '@prisma/client'
import { DAYJS_FORMATS } from '@/utils'

export function ConfigurationEntry({ configuration }: { configuration: Configuration }) {
    return (
        <div key={configuration.id} className="text-xs">
            <div className="w-full grid grid-cols-12 gap-4 bg-milk-50 hover:bg-milk-100 rounded-lg p-2">
                <p className="col-span-12 truncate">{DAYJS_FORMATS.date(configuration.createdAt)}</p>
                {/* <LinkWrapper href={`${CHAINS_CONFIG[configuration.chainId].explorerRoot}/tx/${configuration.transactionHash}`} className="col-span-6 hover:underline">
                    <p>Tx: {shortenValue(configuration.transactionHash || 'no tx')}</p>
                </LinkWrapper> */}
            </div>
            {/* <pre>{JSON.stringify(trade.values, null, 2)}</pre> */}
        </div>
    )
}

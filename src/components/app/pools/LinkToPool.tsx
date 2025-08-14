'use client'

import { AppSupportedChainIds, FileIds } from '@/enums'
import { AmmPool } from '@/interfaces'
import { cn, mapProtocolIdToProtocolConfig } from '@/utils'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config'
import FileMapper from '@/components/icons/FileMapper'
import numeral from 'numeral'
import { ChainImage } from '@/components/common/ImageWrapper'

export default function PoolLink({
    currentChainId,
    pool,
    config,
    className,
}: {
    currentChainId: AppSupportedChainIds
    pool: AmmPool | undefined
    config?: ReturnType<typeof mapProtocolIdToProtocolConfig>
    className?: string
}) {
    if (!pool)
        return (
            <div className={cn('flex gap-2 items-center group cursor-alias', className)}>
                <p className="text-milk-600 truncate">{config?.id}</p>
            </div>
        )

    return (
        <LinkWrapper
            target="_blank"
            href={
                config?.fileId === FileIds.PROTOCOL_UNISWAP
                    ? `https://app.uniswap.org/explore/pools/${CHAINS_CONFIG[currentChainId].name.toLowerCase()}/${pool.address}`
                    : `${CHAINS_CONFIG[currentChainId].explorerRoot}/address/${pool.address}`
            }
            className={cn('flex gap-2 items-center group cursor-alias transition-all duration-300 ease-in-out pl-1', className)}
        >
            <div className="relative pl-1">
                <FileMapper id={config?.fileId} className="size-7 rounded-full" />
                <ChainImage id={currentChainId} className="size-3 absolute -bottom-0 -left-1.5" />
            </div>
            <p className="truncate group-hover:underline">
                {config?.version ? `${config?.version.toLowerCase()} - ` : ''}
                {numeral(pool.fee).format('0.[00]')} bps
            </p>
            {/* <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4 text-milk-200 group-hover:text-milk" /> */}
        </LinkWrapper>
    )
}

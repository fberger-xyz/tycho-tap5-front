import { AppSupportedProtocols, FileIds } from '@/enums'
import { ProtocolConfig } from '@/interfaces'

export const PROTOCOLS_CONFIG: Record<AppSupportedProtocols, ProtocolConfig> = {
    [AppSupportedProtocols.BALANCER]: {
        id: AppSupportedProtocols.BALANCER,
        name: 'Balancer',
        fileId: FileIds.PROTOCOL_BALANCER,
    },
    [AppSupportedProtocols.CURVE]: {
        id: AppSupportedProtocols.CURVE,
        name: 'Curve',
        fileId: FileIds.PROTOCOL_CURVE,
    },
    [AppSupportedProtocols.PANCAKESWAP]: {
        id: AppSupportedProtocols.PANCAKESWAP,
        name: 'Pancakeswap',
        fileId: FileIds.PROTOCOL_PANCAKESWAP,
    },
    [AppSupportedProtocols.SUSHISWAP]: {
        id: AppSupportedProtocols.SUSHISWAP,
        name: 'Sushiswap',
        fileId: FileIds.PROTOCOL_SUSHISWAP,
    },
    [AppSupportedProtocols.UNISWAP]: {
        id: AppSupportedProtocols.UNISWAP,
        name: 'Uniswap',
        fileId: FileIds.PROTOCOL_UNISWAP,
    },
}

export const getProtocolConfig = (protocol: string) => {
    const protocolName = protocol.split('_')[0].toLowerCase().trim()
    if (PROTOCOLS_CONFIG[protocolName as AppSupportedProtocols]) {
        return PROTOCOLS_CONFIG[protocolName as AppSupportedProtocols]
    }
    return {
        id: '',
        name: 'Unknown',
        fileId: '',
    }
}

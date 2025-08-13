import { FileIds } from '@/enums'

const mapProtocolNameToSvgId = (protocolName: string): undefined | FileIds => {
    if (!protocolName) return undefined
    let svgId = FileIds.PROTOCOL_BALANCER
    if (protocolName.includes('balancer')) svgId = FileIds.PROTOCOL_BALANCER
    if (protocolName.includes('sushi')) svgId = FileIds.PROTOCOL_SUSHISWAP
    if (protocolName.includes('pancake')) svgId = FileIds.PROTOCOL_PANCAKESWAP
    if (protocolName.includes('uniswap')) svgId = FileIds.PROTOCOL_UNISWAP
    if (protocolName.includes('curve')) svgId = FileIds.PROTOCOL_CURVE
    return svgId
}

// https://docs.propellerheads.xyz/tycho/for-solvers/supported-protocols
export const mapProtocolIdToProtocolConfig = (protocolId: string) => {
    const config: { id: string; version: string; name: string; fileId?: FileIds } = {
        id: (protocolId ?? '').toLowerCase(),
        name: '',
        version: '',
        fileId: mapProtocolNameToSvgId(protocolId),
    }
    if (config.id.includes('balancer')) {
        config.name = 'Balancer v2'
        config.version = 'v2'
    } else if (config.id.includes('ekubo')) {
        config.name = 'Ekubo'
        config.version = 'v2'
    } else if (config.id.includes('sushi')) {
        config.name = 'Sushiswap v2'
        config.version = 'v2'
    } else if (config.id.includes('pancake')) {
        if (config.id.includes('2')) {
            config.name = 'PancakeSwap v2'
            config.version = 'v2'
        } else if (config.id.includes('3')) {
            config.name = 'PancakeSwap v3'
            config.version = 'v3'
        }
    } else if (config.id.includes('curve')) {
        config.name = 'Curve'
        config.version = ''
    } else if (config.id.includes('uniswap')) {
        if (config.id.includes('2')) {
            config.name = 'Uniswap v2'
            config.version = 'v2'
        } else if (config.id.includes('3')) {
            config.name = 'Uniswap v3'
            config.version = 'v3'
        } else if (config.id.includes('4')) {
            config.name = 'Uniswap v4'
            config.version = 'v4'
        }
    }
    return config
}

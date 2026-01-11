import Card from '@/components/figma/Card'
import StatRow from '@/components/app/strategies/strategy/StatRow'
import LinkWrapper from '@/components/common/LinkWrapper'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { shortenValue } from '@/utils'
import numeral from 'numeral'

interface StrategyConfigurationProps {
    parsedConfig: {
        chain: { id: number }
        base: { address: string; symbol: string }
        quote: { address: string; symbol: string }
        execution: {
            minSpreadThresholdBps?: number
            maxSlippagePct: number
            priceFeedConfig?: { type?: string }
            minWatchSpreadBps?: number
            minExecSpreadBps?: number
            txGasLimit: number
            pollIntervalMs: number
            blockOffset?: number
            inclusionBlockDelay?: number
            minPublishTimeframeMs?: number
            publishEvents?: boolean
            gasTokenSymbol?: string
            skipSimulation?: boolean
        }
        inventory: {
            walletPublicKey?: string
            maxInventoryRatio?: number
        }
        tycho?: {
            permit2Address?: string
            tychoRouterAddress?: string
            infiniteApproval?: boolean
        }
    }
    priceSourceUrl?: string | null
    trades: Array<{ id: string }>
}

const STRATEGY_LABELS = {
    STATS: {
        CHAIN: 'Chain',
        BASE_TOKEN: 'Base Token',
        QUOTE_TOKEN: 'Quote Token',
        TARGET_SPREAD: 'Target Spread',
        TOTAL_TRADES: 'Total trades',
        MAX_SLIPPAGE: 'Max Slippage',
        DAILY_GAS_BUDGET: 'Daily Gas Budget',
        PRICE_FEED: 'Reference Price',
        EOA: 'EOA',
        TX_GAS_LIMIT: 'Tx Gas Limit',
        POLL_INTERVAL: 'Poll Interval',
        BLOCK_OFFSET: 'Block Offset',
        PERMIT2: 'Permit2 Address',
        MIN_WATCH_SPREAD: 'Min Watch Spread',
        MIN_EXEC_SPREAD: 'Min Exec Spread',
        INCLUSION_BLOCK_DELAY: 'Inclusion Block Delay',
        MIN_PUBLISH_TIMEFRAME: 'Min Publish Timeframe',
        PUBLISH_EVENTS: 'Publish Events',
        GAS_TOKEN: 'Gas Token',
        MAX_INVENTORY_RATIO: 'Max Inventory Ratio',
        INFINITE_APPROVAL: 'Infinite Approval',
        SKIP_SIMULATION: 'Skip Simulation',
        TYCHO_ROUTER: 'Tycho Router',
    },
    PLACEHOLDERS: {
        NOT_SET: 'Not set',
        UNKNOWN: 'Unknown',
    },
} as const

export default function StrategyConfiguration({ parsedConfig, priceSourceUrl, trades }: StrategyConfigurationProps) {
    const chainId = parsedConfig.chain.id
    const explorerRoot = CHAINS_CONFIG[chainId]?.explorerRoot
    const walletAddress = parsedConfig.inventory.walletPublicKey || ''

    return (
        <Card className="gap-5">
            <h1 className="font-inter-tight text-lg font-semibold">Configuration</h1>
            <div className="flex flex-col gap-3 text-sm">
                <StatRow
                    label={STRATEGY_LABELS.STATS.CHAIN}
                    value={<p className="truncate capitalize">{CHAINS_CONFIG[chainId]?.name || 'Unknown'}</p>}
                />

                <StatRow
                    label={STRATEGY_LABELS.STATS.BASE_TOKEN}
                    value={
                        <LinkWrapper
                            href={`${explorerRoot}/token/${parsedConfig.base.address}`}
                            className="cursor-alias truncate hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {parsedConfig.base.symbol} ({shortenValue(parsedConfig.base.address)})
                        </LinkWrapper>
                    }
                />

                <StatRow
                    label={STRATEGY_LABELS.STATS.QUOTE_TOKEN}
                    value={
                        <LinkWrapper
                            href={`${explorerRoot}/token/${parsedConfig.quote.address}`}
                            className="cursor-alias truncate hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {parsedConfig.quote.symbol} ({shortenValue(parsedConfig.quote.address)})
                        </LinkWrapper>
                    }
                />

                <StatRow
                    label={STRATEGY_LABELS.STATS.TARGET_SPREAD}
                    value={
                        parsedConfig.execution.minSpreadThresholdBps
                            ? `${parsedConfig.execution.minSpreadThresholdBps} bps`
                            : STRATEGY_LABELS.PLACEHOLDERS.UNKNOWN
                    }
                />

                <StatRow label={STRATEGY_LABELS.STATS.TOTAL_TRADES} value={trades.length.toString()} />

                <StatRow
                    label={STRATEGY_LABELS.STATS.MAX_SLIPPAGE}
                    explanation="Maximum allowed slippage"
                    value={`${Math.round(parsedConfig.execution.maxSlippagePct * 10000) || 0} bps`}
                />

                <StatRow
                    label={STRATEGY_LABELS.STATS.PRICE_FEED}
                    explanation="Price feed source type and data source URL"
                    value={
                        <LinkWrapper
                            href={priceSourceUrl || ''}
                            className="cursor-alias truncate capitalize hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {parsedConfig.execution.priceFeedConfig?.type || STRATEGY_LABELS.PLACEHOLDERS.UNKNOWN}
                        </LinkWrapper>
                    }
                />

                <StatRow
                    label={STRATEGY_LABELS.STATS.EOA}
                    explanation="Trading wallet public address"
                    value={
                        <LinkWrapper
                            href={`${explorerRoot}/address/${walletAddress}`}
                            className="cursor-alias truncate capitalize hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {shortenValue(walletAddress)}
                        </LinkWrapper>
                    }
                />

                {parsedConfig.execution.minWatchSpreadBps !== undefined && (
                    <StatRow
                        label={STRATEGY_LABELS.STATS.MIN_WATCH_SPREAD}
                        explanation="Minimum spread to trigger a trade (in basis points)"
                        value={`${parsedConfig.execution.minWatchSpreadBps} bps`}
                    />
                )}

                {parsedConfig.execution.minExecSpreadBps !== undefined && (
                    <StatRow
                        label={STRATEGY_LABELS.STATS.MIN_EXEC_SPREAD}
                        explanation="Minimum profitability to execute trades (in basis points)"
                        value={`${parsedConfig.execution.minExecSpreadBps} bps`}
                    />
                )}

                <StatRow
                    label={STRATEGY_LABELS.STATS.TX_GAS_LIMIT}
                    explanation="Maximum gas units per trade"
                    value={numeral(parsedConfig.execution.txGasLimit).format('0,0')}
                />

                <StatRow
                    label={STRATEGY_LABELS.STATS.POLL_INTERVAL}
                    explanation="Time between market data updates"
                    value={`${parsedConfig.execution.pollIntervalMs} ms`}
                />

                {parsedConfig.execution.blockOffset !== undefined && (
                    <StatRow
                        label={STRATEGY_LABELS.STATS.BLOCK_OFFSET}
                        explanation="Block number offset"
                        value={parsedConfig.execution.blockOffset.toString()}
                    />
                )}

                {parsedConfig.tycho?.permit2Address && (
                    <StatRow
                        label={STRATEGY_LABELS.STATS.PERMIT2}
                        explanation="Permit2 contract for token approvals"
                        value={
                            <LinkWrapper
                                href={`${explorerRoot}/address/${parsedConfig.tycho.permit2Address}`}
                                className="cursor-alias truncate hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {shortenValue(parsedConfig.tycho.permit2Address)}
                            </LinkWrapper>
                        }
                    />
                )}

                {parsedConfig.execution.publishEvents !== undefined && (
                    <StatRow
                        label={STRATEGY_LABELS.STATS.PUBLISH_EVENTS}
                        explanation="Whether to save trading events in DB"
                        value={parsedConfig.execution.publishEvents ? 'Yes' : 'No'}
                    />
                )}

                {parsedConfig.inventory?.maxInventoryRatio !== undefined && (
                    <StatRow
                        label={STRATEGY_LABELS.STATS.MAX_INVENTORY_RATIO}
                        explanation="Maximum trade size relative to total inventory"
                        value={`${(parsedConfig.inventory.maxInventoryRatio * 100).toFixed(1)}%`}
                    />
                )}
            </div>
        </Card>
    )
}

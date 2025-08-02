// 'use client'

// import { ReactNode, useState } from 'react'
// import { useParams } from 'next/navigation'
// import { useStrategies } from '@/hooks/fetchs/all/useStrategies'
// import { ChainImage, DoubleSymbol } from '@/components/common/ImageWrapper'
// import { cn, listTradesByChain } from '@/utils'
// import { StrategyChain } from './StrategyChain'
// import { IconIds } from '@/enums/icons.enum'
// import IconWrapper from '@/components/icons/IconWrapper'
// import { Strategy } from '@/types'
// import { ErrorPlaceholder, LoadingPlaceholder, NotFoundPlaceholder } from '../../shared/PlaceholderTemplates'
// import { SupportedFilterDirections, SupportedStrategyChainsFilters } from '@/enums'
// import { useAppStore } from '@/stores/app.store'

// const StrategyHeader = ({ strategy }: { strategy: Strategy }) => {
//     return (
//         <div className="flex flex-row gap-3 center items-center mb-4">
//             <DoubleSymbol symbolLeft={strategy.base.symbol} symbolRight={strategy.quote.symbol} size={50} gap={2} />
//             <div className="flex flex-col">
//                 <p className="truncate font-semibold text-xl">
//                     {strategy.base.symbol} / {strategy.quote.symbol}
//                 </p>
//                 <div className="flex items-center">
//                     {/* <p className="text-milk-400 text-xs">
//                         {listTrades(strategy).length} trade{listTrades(strategy).length > 1 ? 's' : ''} on {strategy.chains.length} chain
//                         {strategy.chains.length > 1 ? 's' : ''}
//                     </p> */}
//                 </div>
//             </div>
//         </div>
//     )
// }

// const StrategyChainEntryTemplate = (props: {
//     chain: ReactNode
//     trades: ReactNode
//     aum: ReactNode
//     pnl: ReactNode
//     actions: ReactNode
//     className?: string
// }) => {
//     return (
//         <div className={cn('w-full grid grid-cols-12 gap-2 items-center p-3 py-1', props.className)}>
//             <div className="flex justify-start items-center col-span-5">{props.chain}</div>
//             <div className="flex justify-center col-span-2">{props.trades}</div>
//             <div className="flex justify-center col-span-2">{props.aum}</div>
//             <div className="flex justify-center col-span-2">{props.pnl}</div>
//             <div className="flex justify-center items-center col-span-1">{props.actions}</div>
//         </div>
//     )
// }

// const SortableHeader = ({ children, sortKey }: { children: ReactNode; sortKey?: SupportedStrategyChainsFilters }) => {
//     const { strategyChainsSortedBy, sortStrategyChainsBy, toggleStrategyChainsFilterDirection, strategyChainsSortedByFilterDirection } = useAppStore()
//     if (!sortKey) return <>{children}</>
//     const isActive = strategyChainsSortedBy === sortKey
//     const isAscending = strategyChainsSortedByFilterDirection === SupportedFilterDirections.ASCENDING
//     return (
//         <button
//             onClick={() => {
//                 if (isActive) toggleStrategyChainsFilterDirection()
//                 else sortStrategyChainsBy(sortKey)
//             }}
//             className="flex items-center gap-1 hover:text-milk-300 transition-colors min-w-fit"
//         >
//             <p className="truncate text-center text-sm text-milk-400 font-semibold">{children}</p>
//             <div className="flex flex-col w-5 h-9 relative">
//                 <IconWrapper
//                     id={IconIds.TRIANGLE_UP}
//                     className={cn(
//                         'size-6 absolute top-1 transition-opacity duration-200',
//                         isActive && isAscending ? 'text-aquamarine opacity-100' : 'text-milk-400',
//                     )}
//                 />
//                 <IconWrapper
//                     id={IconIds.TRIANGLE_DOWN}
//                     className={cn(
//                         'size-6 absolute bottom-0.5 transition-opacity duration-200',
//                         isActive && !isAscending ? 'text-aquamarine opacity-100' : 'text-milk-400',
//                     )}
//                 />
//             </div>
//         </button>
//     )
// }

// const ChainEntriesFilters = () => {
//     return (
//         <div className="w-full border-l ml-6 border-milk-200">
//             <StrategyChainEntryTemplate
//                 chain={null}
//                 trades={<SortableHeader sortKey={SupportedStrategyChainsFilters.TRADE_COUNT}>Trades</SortableHeader>}
//                 pnl={<SortableHeader sortKey={SupportedStrategyChainsFilters.INSTANCES}>Positions</SortableHeader>}
//                 aum={<SortableHeader sortKey={SupportedStrategyChainsFilters.AUM}>AUM</SortableHeader>}
//                 actions={null}
//                 className="py-0"
//             />
//         </div>
//     )
// }

// // export default function StrategyBreakdownPerChain() {
// //     const params = useParams()
// //     const strategyId = params.strategy as string
// //     const { isLoading, error, hasError, strategies } = useStrategies()
// //     const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({})
// //     const { strategyChainsSortedBy, strategyChainsSortedByFilterDirection } = useAppStore()
// //     // Find the strategy by pair
// //     const strategy = strategies.find((s) => s.pair.toLowerCase() === strategyId.toLowerCase())

// //     // Loading, error, not found
// //     if (isLoading && !strategy) return <LoadingPlaceholder entryName="Strategy" />
// //     if (hasError && error) return <ErrorPlaceholder entryName="Strategy" />
// //     if (!strategy) return <NotFoundPlaceholder entryName="Strategy" />

// //     return (
// //         <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
// //             {/* top lg:left */}
// //             <div className="col-span-1 lg:col-span-12 flex flex-col h-fit min-w-[600px]">
// //                 <StrategyHeader strategy={strategy} />
// //                 <ChainEntriesFilters />
// //                 {strategy.chains
// //                     .filter((chain, index, chains) => chains.findIndex((c) => c.value.id === chain.value.id) === index)
// //                     .filter((chain) => chain.configurations.length > 0)
// //                     .sort((a, b) => {
// //                         if (strategyChainsSortedBy === SupportedStrategyChainsFilters.TRADE_COUNT) {
// //                             return strategyChainsSortedByFilterDirection === SupportedFilterDirections.ASCENDING
// //                                 ? listTradesByChain(a).length - listTradesByChain(b).length
// //                                 : listTradesByChain(b).length - listTradesByChain(a).length
// //                         }
// //                         if (strategyChainsSortedBy === SupportedStrategyChainsFilters.INSTANCES) {
// //                             return strategyChainsSortedByFilterDirection === SupportedFilterDirections.ASCENDING
// //                                 ? b.configurations.length - a.configurations.length
// //                                 : a.configurations.length - b.configurations.length
// //                         } else if (strategyChainsSortedBy === SupportedStrategyChainsFilters.CHAIN_NAME) {
// //                             return strategyChainsSortedByFilterDirection === SupportedFilterDirections.ASCENDING
// //                                 ? b.value.name.localeCompare(a.value.name)
// //                                 : a.value.name.localeCompare(b.value.name)
// //                         }
// //                         return 0
// //                     })
// //                     .map((chain, chainIndex, chains) => (
// //                         <div key={`${chain.value.id}-${chainIndex}`} className="w-full flex flex-col pl-6 overflow-hidden">
// //                             {/* chain header + details */}
// //                             <div className={cn('flex flex-col', chainIndex < chains.length - 1 ? 'border-l border-milk-200' : '')}>
// //                                 {/* a. line + summary */}
// //                                 <div className={cn('flex items-end w-full gap-0 ')}>
// //                                     {/* line */}
// //                                     <div className="flex flex-col gap-4 h-full">
// //                                         <div
// //                                             className={cn(
// //                                                 'border-b border-milk-200 pb-4 w-6 h-0 pt-4',
// //                                                 chainIndex === chains.length - 1 ? 'border-l' : '',
// //                                             )}
// //                                         />
// //                                         <div className={cn('h-1')} />
// //                                     </div>

// //                                     {/* summary */}
// //                                     <button
// //                                         onClick={() => setExpandedChains((prev) => ({ ...prev, [chain.value.id]: !prev[chain.value.id] }))}
// //                                         className="w-full flex gap-2 items-center justify-between group rounded-xl"
// //                                     >
// //                                         <StrategyChainEntryTemplate
// //                                             chain={
// //                                                 <div className="flex gap-2 items-center">
// //                                                     <ChainImage id={chain.value.id} size={24} />
// //                                                     <p className="font-semibold text-base text-milk-600">{chain.value.name}</p>
// //                                                 </div>
// //                                             }
// //                                             trades={
// //                                                 <p className="text-milk-400">
// //                                                     {listTradesByChain(chain).length} trade
// //                                                     {listTradesByChain(chain).length > 1 ? 's' : ''}
// //                                                 </p>
// //                                             }
// //                                             aum={<p className="text-milk-400">AUM: todo</p>}
// //                                             pnl={<p className="text-milk-400">P&L: todo</p>}
// //                                             actions={
// //                                                 <div className="ml-10 p-2 group-hover:bg-milk-100 rounded-full bg-milk-50 transition-colors">
// //                                                     <IconWrapper
// //                                                         id={expandedChains[chain.value.id] ? IconIds.CHEVRON_UP : IconIds.CHEVRON_DOWN}
// //                                                         className="w-4 h-4"
// //                                                     />
// //                                                 </div>
// //                                             }
// //                                         />
// //                                     </button>
// //                                 </div>

// //                                 {/* b. chain details */}
// //                                 {expandedChains[chain.value.id] && <StrategyChain chain={chain} />}
// //                             </div>
// //                         </div>
// //                     ))}
// //             </div>

// //             {/* bottom lg:right */}
// //             {/* <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 border h-fit overflow-hidden">
// //                 {listTrades(strategy).map((trade) => (
// //                     <div key={trade.id}>
// //                         <p>trade:{formatDate(trade.createdAt)}</p>
// //                         <pre>{JSON.stringify(trade, null, 2)}</pre>
// //                     </div>
// //                 ))}
// //                 <pre>{JSON.stringify(strategy, null, 2)}</pre>
// //             </div> */}
// //         </div>
// //     )
// // }

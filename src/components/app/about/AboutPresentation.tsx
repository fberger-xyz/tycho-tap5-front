import { FeatureCard } from '@/components/app/about/AboutFeatures'

const reasonsToUseTychoMM = {
    marketMaker: {
        title: 'Market Maker',
        description: 'Bring stability to your token’s markets. Monitor, simulate, and execute corrective trades on-chain, automatically.',
    },
    depthAndSpread: {
        title: 'Depth & Spread',
        description: 'Enforce tighter spreads and ensure consistent depth across pools – creating healthier markets for your community.',
    },
    smartRouting: {
        title: 'Smart Routing',
        description: 'Aggregate liquidity across all DEXs and split trades optimally for best price alignment.',
    },
    inventoryAware: {
        title: 'Inventory Aware',
        description: 'The bot operates only within your wallet balances, avoiding overexposure and helping you manage inventory safely.',
    },
}

export default function AboutPresentation() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 max-w-[1050px] mx-auto">
            <FeatureCard
                className="h-[387px] flex-col lg:flex-row"
                text={
                    <div className="flex gap-2 flex-col z-50">
                        <p className="text-sm text-aquamarine">{reasonsToUseTychoMM.marketMaker.title}</p>
                        <p className="font-light text-lg lg:max-w-[200px]">{reasonsToUseTychoMM.marketMaker.description}</p>
                    </div>
                }
                svg={
                    <>
                        <div className="hidden lg:flex absolute top-8 right-0">
                            <div className="w-[220px] h-[415px] bg-milk-100" />
                        </div>
                        <div className="lg:hidden absolute top-40 right-0">
                            <div className="w-[300px] h-[800px] bg-milk-100" />
                        </div>
                    </>
                }
            />

            <FeatureCard
                className="flex-col h-[387px]"
                text={
                    <div className="flex gap-2 flex-col z-50">
                        <p className="text-sm text-aquamarine">{reasonsToUseTychoMM.depthAndSpread.title}</p>
                        <p className="font-light text-lg">{reasonsToUseTychoMM.depthAndSpread.description}</p>
                    </div>
                }
                svg={
                    <div className="absolute left-8 bottom-8">
                        <div className="w-[515px] h-[157px] bg-milk-100" />
                    </div>
                }
            />

            <FeatureCard
                className="flex-col h-[275px]"
                text={
                    <div className="flex gap-2 flex-col z-50">
                        <p className="text-sm text-aquamarine">{reasonsToUseTychoMM.smartRouting.title}</p>
                        <p className="font-light text-lg">{reasonsToUseTychoMM.smartRouting.description}</p>
                    </div>
                }
                svg={
                    <div className="absolute left-8 bottom-0">
                        <div className="w-[437px] h-[182px] bg-milk-100" />
                    </div>
                }
            />

            <FeatureCard
                className="flex-col h-[275px]"
                text={
                    <div className="flex gap-2 flex-col z-50">
                        <p className="text-sm text-aquamarine">{reasonsToUseTychoMM.inventoryAware.title}</p>
                        <p className="font-light text-lg">{reasonsToUseTychoMM.inventoryAware.description}</p>
                    </div>
                }
                svg={
                    <div className="absolute left-8 bottom-0">
                        <div className="w-[683px] h-[141px] bg-milk-100" />
                    </div>
                }
            />
        </div>
    )
}

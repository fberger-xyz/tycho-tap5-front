import { cn } from '@/utils'
import { ReactNode } from 'react'

export const FeatureCard = ({ className, text, svg }: { className?: string; text: ReactNode; svg: ReactNode }) => {
    return (
        <div
            className="gap-2 border border-milk-50 rounded-xl relative overflow-hidden w-full backdrop-blur-sm"
            style={{ background: 'rgba(255, 244, 224, 0.02)' }}
        >
            <div className={cn('flex p-8 gap-2 overflow-hidden', className)}>
                {text}
                {svg}
            </div>
        </div>
    )
}

const features: {
    className: string
    image: string
    title: string
    description: string
}[] = [
    {
        className: 'col-span-3',
        image: './about-features-shape.svg',
        title: 'On-chain market stabilization',
        description: 'Automatically execute trades to align DEX prices to your desired market reference (e.g. Binance, Chainlink).',
    },
    {
        className: 'col-span-3',
        image: './about-features-trade.svg',
        title: 'CeFi-grade strategies, DeFi-native tools',
        description: 'Adapt proven centralized trading strategies to decentralized markets.',
    },
    {
        className: 'col-span-3',
        image: './about-features-strategies.svg',
        title: 'MEV protection by default',
        description: 'Route trades through private relays or builders to minimize front-running risk.',
    },
    {
        className: 'col-span-3',
        image: './about-features-always-up-dexs.svg',
        title: 'Real-time insights',
        description: 'Monitor pool states, price deviations, and bot activity block by block.',
    },
]

export const AboutFeatures = () => {
    return (
        <div className="flex flex-col w-full items-start gap-4 max-w-[1050px] mx-auto">
            <p className="text-sm text-aquamarine">Features</p>
            <p className="text-[48px] leading-none font-bold max-w-[688px] text-left">Everything Tycho Market Maker brings to your stack</p>
            <div className="relative w-full mt-10">
                <div className="w-full grid grid-cols-2 lg:grid-cols-6 gap-4 pb-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={cn(
                                'flex flex-col p-6 transition-colors duration-300 rounded-xl gap-12 bg-[#FFF4E005] border border-milk-50',
                                feature.className,
                            )}
                        >
                            <div className="flex h-[271px]">
                                <div className="w-[220px] h-full bg-milk-100" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <p className="text-lg">{feature.title}</p>
                                <p className="text-milk-400 text-base text-justify font-light">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

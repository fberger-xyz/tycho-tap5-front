'use client'

import { useState } from 'react'
import LinkWrapper from '@/components/common/LinkWrapper'
import { IconIds } from '@/enums'
import IconWrapper from '@/components/icons/IconWrapper'

const IframeWrapper: React.FC<{
    src?: string
    width?: string
    height?: string
}> = ({ src, width = 'w-[300px] md:w-[600px] lg:w-[800px]', height = 'h-[400px]' }) => {
    const [isLoading, setIsLoading] = useState(true)
    return (
        <div className={`relative z-10 ${width} ${height}`}>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-background">
                    <div className="size-10 animate-spin rounded-full border-t" />
                </div>
            )}
            <iframe src={src} className={`absolute left-0 top-0 z-10 rounded-xl ${width} ${height}`} onLoad={() => setIsLoading(false)} />
            <LinkWrapper
                href={src}
                target="_blank"
                className="absolute bottom-4 right-4 z-50 flex items-center justify-center gap-2 rounded-lg bg-milk-100 px-2 py-1.5 text-milk-400 transition-all duration-300 ease-in-out hover:bg-milk-100 hover:text-milk"
            >
                <p className="font-light">Open in a new tab</p>
                <IconWrapper id={IconIds.ARROW_UP_RIGHT} className="size-4" />
            </LinkWrapper>
        </div>
    )
}

export default IframeWrapper

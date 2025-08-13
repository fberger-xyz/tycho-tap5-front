import React, { ReactNode } from 'react'
import StyledTooltip from '@/components/common/StyledTooltip'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'

interface StatRowProps {
    label: string
    explanation?: string
    value: ReactNode
}

export default function StatRow({ label, explanation, value }: StatRowProps) {
    return (
        <div className="flex justify-between gap-4">
            {explanation ? (
                <StyledTooltip content={explanation} className="max-w-xs">
                    <div className="flex gap-1 cursor-help">
                        <p className="text-milk-600 truncate">{label}</p>
                        <IconWrapper id={IconIds.INFORMATION} className="size-4 text-milk-400" />
                    </div>
                </StyledTooltip>
            ) : (
                <p className="text-milk-600 truncate">{label}</p>
            )}
            {typeof value === 'string' ? <p className="truncate">{value}</p> : value}
        </div>
    )
}

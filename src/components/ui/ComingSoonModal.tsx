'use client'

import { Modal } from '@/components/ui/modal'
import LinkWrapper from '@/components/common/LinkWrapper'
import { AppUrls } from '@/enums'

export function ComingSoonModal({
    opened,
    onClose,
    title,
    description,
}: {
    opened: boolean
    onClose: () => void
    title: string
    description: string
}) {
    return (
        <Modal opened={opened} onClose={onClose}>
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-milk">{title}</h2>
                <p className="text-milk-600">{description}</p>
                <p className="text-wrap text-sm text-milk-400">
                    Reach out to
                    <LinkWrapper href={AppUrls.FBERGER_TELEGRAM} target="_blank" className="pl-1 hover:text-aquamarine hover:underline">
                        @fberger_xyz
                    </LinkWrapper>
                    ,
                    <LinkWrapper href={AppUrls.MERSO_TELEGRAM} target="_blank" className="px-1 hover:text-aquamarine hover:underline">
                        @xMerso
                    </LinkWrapper>
                    and
                    <LinkWrapper href={AppUrls.PROPELLERHEADS_TELEGRAM} target="_blank" className="px-1 hover:text-aquamarine hover:underline">
                        PropellerHeads
                    </LinkWrapper>
                    for implementation requests.
                </p>
            </div>
        </Modal>
    )
}

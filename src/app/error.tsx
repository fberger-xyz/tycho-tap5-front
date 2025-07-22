'use client'

import PageWrapper from '@/components/common/PageWrapper'
import { useEffect } from 'react'
import { extractErrorMessage } from '@/utils'
import IconWrapper from '@/components/icons/IconWrapper'
import { AppUrls, IconIds } from '@/enums'
import LinkWrapper from '@/components/common/LinkWrapper'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => console.error(error), [error])
    return (
        <PageWrapper>
            <div className="mx-auto mt-10 flex flex-col items-center gap-4 max-w-lg">
                <p className="font-semibold text-lg">
                    Sorry, something went <span className="text-orange-500">wrong</span>
                </p>
                <div className="flex w-full flex-col items-center gap-2 rounded-xl">
                    <pre className="text-orange-500 max-h-96 overflow-y-auto border border-dashed border-orange-500/20 rounded-xl px-8 py-10 w-full text-xs text-center text-wrap">
                        {extractErrorMessage(error)}
                    </pre>
                </div>
                <div className="flex w-full flex-col items-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-milk-100 hover:bg-milk-100 px-4 py-4 font-semibold sm:py-2"
                    >
                        <p className="font-semibold">Reload page</p>
                        <IconWrapper id={IconIds.UPDATE_NOW} className="size-5" />
                    </button>

                    <p className="text-sm text-milk">
                        Or reach out for help on telegram:
                        <LinkWrapper href={AppUrls.PROPELLERHEADS_TELEGRAM} target="_blank" className="hover:underline hover:text-aquamarine pl-1">
                            PropellerHeads
                        </LinkWrapper>
                        ,
                        <LinkWrapper href={AppUrls.MERSO_TELEGRAM} target="_blank" className="hover:underline hover:text-aquamarine px-1">
                            @xMerso
                        </LinkWrapper>
                        and
                        <LinkWrapper href={AppUrls.FBERGER_WEBSITE} target="_blank" className="hover:underline hover:text-aquamarine px-1">
                            @fberger_xyz
                        </LinkWrapper>
                    </p>
                </div>
            </div>
        </PageWrapper>
    )
}

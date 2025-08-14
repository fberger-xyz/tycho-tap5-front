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
            <div className="mx-auto mt-10 flex max-w-lg flex-col items-center gap-4">
                <p className="text-lg font-semibold">
                    Sorry, something went <span className="text-orange-500">wrong</span>
                </p>
                <div className="flex w-full flex-col items-center gap-2 rounded-xl">
                    <pre className="max-h-96 w-full overflow-y-auto text-wrap rounded-xl border border-dashed border-orange-500/20 px-8 py-10 text-center text-xs text-orange-500">
                        {extractErrorMessage(error)}
                    </pre>
                </div>
                <div className="flex w-full flex-col items-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-milk-100 px-4 py-4 font-semibold hover:bg-milk-100 sm:py-2"
                    >
                        <p className="font-semibold">Reload page</p>
                        <IconWrapper id={IconIds.UPDATE_NOW} className="size-5" />
                    </button>

                    <p className="text-wrap text-sm text-milk">
                        Or reach out for help:
                        <LinkWrapper href={AppUrls.PROPELLERHEADS_TELEGRAM} target="_blank" className="pl-1 hover:text-aquamarine hover:underline">
                            PropellerHeads
                        </LinkWrapper>
                        ,
                        <LinkWrapper href={AppUrls.MERSO_TELEGRAM} target="_blank" className="px-1 hover:text-aquamarine hover:underline">
                            @xMerso
                        </LinkWrapper>
                        and
                        <LinkWrapper href={AppUrls.FBERGER_WEBSITE} target="_blank" className="px-1 hover:text-aquamarine hover:underline">
                            @fberger_xyz
                        </LinkWrapper>
                    </p>
                </div>
            </div>
        </PageWrapper>
    )
}

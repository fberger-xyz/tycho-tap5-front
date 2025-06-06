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
            <div className="mx-auto mt-10 flex flex-col items-center gap-4">
                <p className="font-semibold text-lg">
                    Sorry, something went <span className="text-orange-500">wrong</span>
                </p>
                <div className="flex w-full flex-col items-center gap-2 rounded-xl">
                    <pre className="text-orange-500 max-h-96 overflow-y-auto border border-dashed border-orange-500 rounded-xl p-8 w-full text-xs text-center text-wrap">
                        {JSON.stringify(extractErrorMessage(error), null, 2)}
                    </pre>
                </div>
                <br />
                <div className="flex w-full flex-col items-center gap-2">
                    <button
                        onClick={() => reset()}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-default hover:bg-default/10 px-3 py-3 font-semibold sm:py-2"
                    >
                        <p className="font-semibold">Reload page</p>
                        <IconWrapper id={IconIds.UPDATE_NOW} className="size-5" />
                    </button>

                    <p className="font-light text-xs">
                        Or reach out for help on telegram:
                        <LinkWrapper href={AppUrls.DEV_TELEGRAM} target="_blank" className="hover:underline px-1">
                            @fberger_xyz
                        </LinkWrapper>
                    </p>
                </div>
            </div>
        </PageWrapper>
    )
}

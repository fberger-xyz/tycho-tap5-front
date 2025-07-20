import LinkWrapper from '@/components/common/LinkWrapper'
import PageWrapper from '@/components/common/PageWrapper'
import IconWrapper from '@/components/icons/IconWrapper'
import { AppUrls, IconIds } from '@/enums'
import AboutPresentation from '@/components/app/about/AboutPresentation'
import { AboutFeatures } from '@/components/app/about/AboutFeatures'
import { AboutLinks } from '@/components/app/about/AboutLinks'
import { SITE_DOMAIN } from '@/config/app.config'

const TITLE = 'Lovable, on‑chain market maker'
const SUBTITLE = `${SITE_DOMAIN} makes it easy for token issuers to stabilize prices and support liquidity across DeFi. Powered by Tycho, this market maker helps you keep your token aligned – without needing a full market making desk.`
const CALL_TO_ACTION = 'Run your market maker'

export default function Page() {
    return (
        <PageWrapper className="mt-20 lg:mt-16">
            <div className="flex flex-col w-full gap-28 items-center">
                {/* tagline */}
                <div className="flex max-w-[570px] flex-col gap-6 items-center">
                    <p className="text-[64px] leading-none font-bold text-center">{TITLE}</p>
                    <p className="text-center max-w-[648px] font-light px-10">{SUBTITLE}</p>
                    <div className="flex gap-2">
                        <LinkWrapper
                            href={AppUrls.MARKET_MAKER}
                            className="bg-folly px-4 py-2.5 rounded-xl opacity-90 hover:opacity-100 transition-all duration-300 ease-in-out w-fit flex gap-2 items-center"
                        >
                            <p className="text-milk truncate">{CALL_TO_ACTION}</p>
                            <IconWrapper id={IconIds.OPEN_LINK_IN_NEW_TAB} className="size-4" />
                        </LinkWrapper>
                        <LinkWrapper
                            href={AppUrls.DOCUMENTATION}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2.5 cursor-alias w-max bg-milk-100 hover:bg-milk-150 transition-colors duration-300 rounded-xl"
                        >
                            <p className="text-milk text-sm truncate">Docs</p>
                            <IconWrapper id={IconIds.OPEN_LINK_IN_NEW_TAB} className="size-4" />
                        </LinkWrapper>
                    </div>
                </div>
                <AboutPresentation />
                <AboutFeatures />
                <AboutLinks />
            </div>
        </PageWrapper>
    )
}

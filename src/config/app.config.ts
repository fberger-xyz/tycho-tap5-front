import { AppUrls } from '@/enums'
import { InterfaceAppLink } from '@/interfaces'

/**
 * meta
 * https://github.com/propeller-heads/tycho-x/blob/main/TAP-5.md
 */

export const SITE_NAME = 'Tycho Market Maker'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const SITE_DOMAIN = 'https://tycho-openmaker.propellerheads.xyz'
export const SITE_URL = SITE_DOMAIN.replace('www.', '')
export const APP_METADATA = {
    SITE_NAME,
    SHORT_NAME: 'Tycho MM',
    SITE_DOMAIN,
    SITE_DESCRIPTION: 'A market maker that anyone can easily run, well documented',
    SITE_URL: SITE_URL,
    AUTHOR: {
        name: 'fberger',
        twitter: '@fberger_xyz',
        url: 'https://twitter.com/fberger_xyz',
    },
    STRUCTURED_DATA: {
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        price: '0',
        priceCurrency: 'USD',
        about: {
            name: 'Market Making',
            description: 'DeFi trading and liquidity provision',
        },
    },
}
export const ORDERBOOK_API_URL = 'https://www.orderbook.wtf/api'

/**
 * pages
 */

export const APP_PAGES: InterfaceAppLink[] = [
    {
        name: 'Strategies',
        path: AppUrls.STRATEGIES,
    },
] as const

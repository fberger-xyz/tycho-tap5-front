import { AppUrls } from '@/enums'
import { InterfaceAppLink } from '@/interfaces'

/**
 * meta
 * https://github.com/propeller-heads/tycho-x/blob/main/TAP-5.md
 */

export const SITE_NAME = 'Tycho Market Maker'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const SITE_DOMAIN = IS_DEV ? 'http://localhost:3000' : 'https://tap5.fberger.xyz'
export const SITE_URL = SITE_DOMAIN.replace('www.', '')
export const APP_METADATA = {
    SITE_NAME,
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
            name: 'Automated Market Making',
            description: 'DeFi trading and liquidity provision',
        },
    },
}

/**
 * pages
 */

export const APP_PAGES: InterfaceAppLink[] = [
    {
        name: 'About',
        path: AppUrls.ABOUT,
    },
    {
        name: 'Market Maker',
        path: AppUrls.MARKET_MAKER,
    },
    // {
    //     name: 'Changelog',
    //     path: AppUrls.LOGS,
    // },
] as const

/**
 * tracking
 * note: disabled
 */

export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''

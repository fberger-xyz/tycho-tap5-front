import { AppUrls } from '@/enums'
import { InterfaceAppLink } from '@/interfaces'
import { Inter } from 'next/font/google'
import resolveConfig from 'tailwindcss/resolveConfig'
import type { Config } from 'tailwindcss'
import tailwindConfig from '../../tailwind.config'
import { DefaultColors } from 'tailwindcss/types/generated/colors'

/**
 * meta
 */

export const SITE_NAME = 'Charts'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const SITE_DOMAIN = IS_DEV ? 'http://localhost:3000' : `https://${SITE_NAME.toLowerCase()}.fberger.xyz`
export const SITE_URL = SITE_DOMAIN.replace('www.', '')
export const APP_METADATA = { SITE_NAME, SITE_DOMAIN, SITE_DESCRIPTION: 'Charts tooling [TBA]', SITE_URL: SITE_URL }

/**
 * pages
 */

export const APP_PAGES: InterfaceAppLink[] = [
    {
        name: 'Home',
        path: AppUrls.HOME,
    },
    {
        name: 'Changelog',
        path: AppUrls.LOGS,
    },
] as const

/**
 * fonds
 */

export const INTER_FONT = Inter({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    preload: true,
})

/**
 * tracking
 * note: disabled
 */

export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''

/**
 * theme
 * note
 */

const fullConfig = resolveConfig(tailwindConfig as Config)
export const AppColors = fullConfig.theme.colors as DefaultColors & {
    background: string
    primary: string
    default: string
}

export const toastStyle = {
    borderRadius: '10px',
    background: AppColors.blue[800],
    borderColor: AppColors.blue[300],
    border: 2,
    color: AppColors.blue[300],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '800px',
} as const

import type { MetadataRoute } from 'next'
import { APP_METADATA } from '@/config/app.config'
import { AppUrls } from '@/enums'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_METADATA.SITE_NAME,
        short_name: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        start_url: AppUrls.STRATEGIES,
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#111111',
        lang: 'en',
        categories: ['tycho', 'market maker', 'defi', 'orderbook'],
        icons: [
            {
                src: '/figma/logo/tap-5-logo.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
            {
                src: '/figma/logo/tap-5-logo.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'maskable',
            },
        ],
    }
}

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
        background_color: '#ffffff',
        theme_color: '#000000',
        lang: 'en',
        categories: ['tycho', 'market maker', 'defi', 'orderbook'],
    }
}

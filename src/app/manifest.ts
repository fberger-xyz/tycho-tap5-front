import type { MetadataRoute } from 'next'
import { APP_METADATA } from '@/config/app.config'
import { AppColors } from '@/config/theme'
import { AppUrls } from '@/enums'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_METADATA.SITE_NAME,
        short_name: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        start_url: AppUrls.MARKET_MAKER,
        display: 'standalone',
        background_color: AppColors.background,
        theme_color: AppColors.primary,
        lang: 'en',
        categories: ['tycho', 'market maker', 'defi', 'orderbook'],
    }
}

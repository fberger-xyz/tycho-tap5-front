import type { MetadataRoute } from 'next'
import { APP_METADATA } from '@/config/app.config'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_METADATA.SITE_NAME,
        short_name: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        start_url: '/',
        display: 'standalone',
        background_color: '#fafafa',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        lang: 'en',
        categories: ['finance', 'defi', 'web3'],
    }
}

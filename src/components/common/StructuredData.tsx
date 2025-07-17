import { APP_METADATA } from '@/config/app.config'
import { AppUrls } from '@/enums'

export default function StructuredData() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        url: APP_METADATA.SITE_URL,
        applicationCategory: APP_METADATA.STRUCTURED_DATA.applicationCategory,
        operatingSystem: APP_METADATA.STRUCTURED_DATA.operatingSystem,
        offers: {
            '@type': 'Offer',
            price: APP_METADATA.STRUCTURED_DATA.price,
            priceCurrency: APP_METADATA.STRUCTURED_DATA.priceCurrency,
        },
        author: {
            '@type': 'Person',
            name: APP_METADATA.AUTHOR.name,
            url: AppUrls.FBERGER_WEBSITE,
        },
        about: {
            '@type': 'Thing',
            name: APP_METADATA.STRUCTURED_DATA.about.name,
            description: APP_METADATA.STRUCTURED_DATA.about.description,
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    )
}
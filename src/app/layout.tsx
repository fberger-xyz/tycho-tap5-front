import type { Metadata } from 'next'
import './globals.css'
import { APP_METADATA } from '../config/app.config'
import { cn } from '../utils'
import { Suspense } from 'react'
import DefaultFallback from '@/components/layouts/DefaultFallback'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/common/ErrorBoundaryFallback'
import Footer from '@/components/layouts/Footer'
import HeaderDesktop from '@/components/layouts/HeaderDesktop'
import HeaderMobile from '@/components/layouts/HeaderMobile'
import { ThemeProvider } from 'next-themes'
import { AppThemes, Authors } from '@/enums'
import { ReactQueryProvider } from '@/providers/react-query.providers'
import PWAProvider from '@/providers/pwa.provider'
import { INTER_FONT, INTER_TIGHT_FONT } from '@/config/theme.config'
import { AppUrls } from '@/enums'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const image = {
    url: '/market-maker.png',
    width: 1494,
    height: 444,
    alt: 'Tycho Market Maker — minimal lovable market maker that showcases how to build a market maker with Tycho.',
    type: 'image/png',
}

export const metadata: Metadata = {
    // Basic metadata
    title: {
        default: APP_METADATA.SITE_NAME,
        template: `%s | ${APP_METADATA.SITE_NAME}`,
    },
    description: APP_METADATA.SITE_DESCRIPTION,
    metadataBase: new URL(APP_METADATA.SITE_URL),

    // Icons
    icons: {
        icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },

    // PWA & Mobile
    appleWebApp: {
        title: APP_METADATA.SHORT_NAME,
        capable: true,
        statusBarStyle: 'black-translucent',
        startupImage: '/figma/logo/tap-5-logo.svg',
    },

    // OpenGraph
    openGraph: {
        type: 'website',
        title: APP_METADATA.SITE_NAME,
        siteName: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        url: APP_METADATA.SITE_URL,
        images: [image],
        locale: 'en_US',
    },

    // Twitter/X
    twitter: {
        card: 'summary_large_image',
        site: APP_METADATA.AUTHOR.twitter,
        creator: APP_METADATA.AUTHOR.twitter,
        title: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        images: [image],
    },

    // Additional metadata
    keywords: ['tycho', 'market maker', 'defi', 'trading', 'automated market maker', 'amm'],
    authors: [
        { name: APP_METADATA.AUTHOR.name, url: APP_METADATA.AUTHOR.url },
        { name: 'xMerso', url: 'https://x.com/xMerso' },
        { name: 'hugoschrng', url: 'https://x.com/hugoschrng' },
        { name: 'PropellerHeads', url: 'https://www.propellerheads.xyz/' },
    ],
    category: 'finance',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

const Providers = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider
        attribute="class"
        defaultTheme={AppThemes.DARK}
        forcedTheme={AppThemes.DARK}
        disableTransitionOnChange
        themes={Object.values(AppThemes)}
    >
        <ReactQueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
        </ReactQueryProvider>
    </ThemeProvider>
)

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        url: APP_METADATA.SITE_URL,
        applicationCategory: APP_METADATA.STRUCTURED_DATA.applicationCategory,
        operatingSystem: APP_METADATA.STRUCTURED_DATA.operatingSystem,
        author: {
            '@type': Authors.PROPELLER_HEADS,
            name: APP_METADATA.AUTHOR.name,
            url: AppUrls.PROPELLERHEADS_WEBSITE,
        },
    }

    return (
        <html lang="en" suppressHydrationWarning className="h-screen w-screen bg-background">
            <head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            </head>
            <body
                className={cn(
                    INTER_FONT.className,
                    INTER_FONT.variable,
                    INTER_TIGHT_FONT.variable,
                    'min-h-screen w-full overflow-x-auto overflow-y-auto text-base text-milk',
                )}
            >
                <PWAProvider>
                    <Providers>
                        <main className="flex flex-col min-h-screen">
                            <Suspense fallback={null}>
                                <HeaderDesktop />
                                <HeaderMobile />
                            </Suspense>
                            <Suspense fallback={<DefaultFallback />}>
                                <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>{children}</ErrorBoundary>
                            </Suspense>
                            <Suspense fallback={null}>
                                <Footer />
                            </Suspense>
                            <Toaster position="bottom-right" reverseOrder={true} />
                        </main>
                    </Providers>
                </PWAProvider>
                {/* <Hotjar /> */}
                {/* <Analytics /> */}
            </body>
        </html>
    )
}

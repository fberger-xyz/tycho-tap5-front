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
// import { Analytics } from '@/components/analytics/GoogleAnalytics'
// import { Hotjar } from '@/components/analytics/Hotjar'
import HeaderDesktop from '@/components/layouts/HeaderDesktop'
import HeaderMobile from '@/components/layouts/HeaderMobile'
import { ThemeProvider } from 'next-themes'
import { AppThemes } from '@/enums'
import { ReactQueryProvider } from '@/providers/react-query.providers'
import PWAProvider from '@/providers/pwa.provider'
import { INTER_FONT, INTER_TIGHT_FONT } from '@/config/theme'

const image = {
    url: '/github/market-maker.png',
    width: 1494,
    height: 444,
    alt: 'Tycho Market Maker — minimal lovable market maker that showcases how to build a market maker with Tycho.',
    type: 'image/png',
}

export const metadata: Metadata = {
    icons: {
        icon: '/favicon.svg',
    },
    title: APP_METADATA.SITE_NAME,
    description: APP_METADATA.SITE_DESCRIPTION,
    metadataBase: new URL(APP_METADATA.SITE_URL),
    appleWebApp: {
        title: APP_METADATA.SITE_NAME,
        capable: true,
        statusBarStyle: 'black-translucent',
    },
    openGraph: {
        type: 'website',
        title: APP_METADATA.SITE_URL.replace('https://', ''),
        siteName: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        url: APP_METADATA.SITE_URL,
        images: [image],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@fberger_xyz',
        title: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
        images: [image],
    },
}

const Providers = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange themes={Object.values(AppThemes)}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
    </ThemeProvider>
)

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="h-screen w-screen bg-background">
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
                        <main>
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

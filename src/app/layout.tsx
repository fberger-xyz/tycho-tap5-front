import type { Metadata } from 'next'
import './globals.css'
import { INTER_FONT, APP_METADATA } from '../config/app.config'
import { cn } from '../utils'
import { Suspense } from 'react'
import DefaultFallback from '@/components/layouts/DefaultFallback'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/common/ErrorBoundaryFallback'
import Footer from '@/components/layouts/Footer'
import { Analytics } from '@/components/analytics/GoogleAnalytics'
import HeaderDesktop from '@/components/layouts/HeaderDesktop'
import HeaderMobile from '@/components/layouts/HeaderMobile'
import { ThemeProvider } from 'next-themes'
import { AppThemes } from '@/enums'
import { ReactQueryProvider } from '@/providers/react-query.providers'
import PWAProvider from '@/providers/pwa.provider'

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
    },
    twitter: {
        card: 'summary_large_image',
        site: '@fberger_xyz',
        title: APP_METADATA.SITE_NAME,
        description: APP_METADATA.SITE_DESCRIPTION,
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
                    'relative h-screen w-screen bg-background overflow-x-auto overflow-y-auto text-default',
                )}
            >
                <PWAProvider>
                    <Providers>
                        <main className="relative">
                            <div className="absolute -top-[600px] -z-20 h-[800px] w-full rounded-full opacity-5 blur-3xl dark:opacity-[0.08]" />
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
                            <Toaster position="bottom-center" reverseOrder={true} />
                        </main>
                    </Providers>
                </PWAProvider>
                <Analytics />
            </body>
        </html>
    )
}

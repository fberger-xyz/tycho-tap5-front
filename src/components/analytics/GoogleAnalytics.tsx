'use client'

import Script from 'next/script'
import { env } from '@/env/t3-env'

export const Analytics = () =>
    env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ? (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=G-${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`} strategy="lazyOnload" />
            <Script id="gtag-init" strategy="lazyOnload">
                {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
      `}
            </Script>
        </>
    ) : null

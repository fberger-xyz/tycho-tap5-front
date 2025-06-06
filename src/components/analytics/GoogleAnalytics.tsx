'use client'

import { GOOGLE_ANALYTICS_ID } from '@/config/app.config'
import Script from 'next/script'

export const Analytics = () =>
    GOOGLE_ANALYTICS_ID ? (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=G-${GOOGLE_ANALYTICS_ID}`} strategy="lazyOnload" />
            <Script id="gtag-init" strategy="lazyOnload">
                {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-${GOOGLE_ANALYTICS_ID}');
      `}
            </Script>
        </>
    ) : null

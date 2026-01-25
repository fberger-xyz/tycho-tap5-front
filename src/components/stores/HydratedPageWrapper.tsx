'use client'

import { useAppStore } from '@/stores/app.store'
import { ReactNode } from 'react'
import PageWrapper from '@/components/common/PageWrapper'

// waits for zustand persist middleware to hydrate before rendering children
// prevents hydration mismatch between server (no localStorage) and client
export default function HydratedPageWrapper(props: { children: ReactNode; className?: string; paddingX?: string }) {
    const hasHydrated = useAppStore((state) => state.hasHydrated)
    if (!hasHydrated) return null
    return (
        <PageWrapper className={props.className} paddingX={props.paddingX}>
            {props.children}
        </PageWrapper>
    )
}

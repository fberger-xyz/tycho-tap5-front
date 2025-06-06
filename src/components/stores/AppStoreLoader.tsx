'use client'

import { useAppStore } from '@/stores/app.store'
import { ReactNode, useEffect } from 'react'
import PageWrapper from '../common/PageWrapper'

export default function AppStoreLoader(props: { children: ReactNode }) {
    const { hasHydrated } = useAppStore()
    const loadAppStore = () => useAppStore.persist.rehydrate()
    useEffect(() => {
        if (!hasHydrated) loadAppStore()
    }, [hasHydrated])
    return <PageWrapper>{props.children}</PageWrapper>
}

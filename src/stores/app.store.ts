'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { APP_METADATA, IS_DEV } from '@/config/app.config'

export const useAppStore = create<{
    /**
     * store
     */

    hasHydrated: boolean
    setHasHydrated: (hasHydrated: boolean) => void

    /**
     * ui
     */

    appStoreRefreshedAt: number
    setAppStoreRefreshedAt: (appStoreRefreshedAt: number) => void
    showMobileMenu: boolean
    setShowMobileMenu: (showMobileMenu: boolean) => void

    /**
     * computeds
     */
}>()(
    persist(
        (set) => ({
            /**
             * store
             */

            hasHydrated: false,
            setHasHydrated: (hasHydrated) => set(() => ({ hasHydrated })),

            /**
             * ui
             */

            appStoreRefreshedAt: -1,
            setAppStoreRefreshedAt: (appStoreRefreshedAt) => set(() => ({ appStoreRefreshedAt })),
            showMobileMenu: false,
            setShowMobileMenu: (showMobileMenu) => set(() => ({ showMobileMenu })),
        }),
        {
            name: `${APP_METADATA.SITE_DOMAIN}-app-store-${IS_DEV ? 'dev' : 'prod'}-${process.env.NEXT_PUBLIC_COMMIT_TIMESTAMP}`,
            storage: createJSONStorage(() => sessionStorage),
            skipHydration: false,
            onRehydrateStorage: () => (state) => {
                if (state && !state.hasHydrated) state.setHasHydrated(true)
            },
        },
    ),
)

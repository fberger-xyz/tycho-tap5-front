'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { APP_METADATA, IS_DEV } from '@/config/app.config'
import { SupportedFilters, SupportedFilterDirections, InstanceDisplayMode, SupportedStrategyChainsFilters, ListToShow } from '@/enums'
import { env } from '@/env/t3-env'

// state
interface AppStoreState {
    hasHydrated: boolean
    appStoreRefreshedAt: number
    showMobileMenu: boolean
    showActivitySection: boolean
    showInstancesSection: boolean
    showStrategiesSection: boolean
    showCandlesSection: boolean
    showInventorySection: boolean
    listToShow: ListToShow
    instancesSortedBy: SupportedFilters
    instancesSortedByFilterDirection: SupportedFilterDirections
    strategyChainsSortedBy: SupportedStrategyChainsFilters
    strategyChainsSortedByFilterDirection: SupportedFilterDirections
    instanceDisplayMode: InstanceDisplayMode
}

// actions
interface AppStoreActions {
    setHasHydrated: (hasHydrated: boolean) => void
    setAppStoreRefreshedAt: (appStoreRefreshedAt: number) => void
    setShowMobileMenu: (showMobileMenu: boolean) => void
    setShowActivitySection: (showActivitySection: boolean) => void
    setShowInstancesSection: (showInstancesSection: boolean) => void
    setShowStrategiesSection: (showStrategiesSection: boolean) => void
    setShowCandlesSection: (showCandlesSection: boolean) => void
    setShowInventorySection: (showInventorySection: boolean) => void
    setListToShow: (listToShow: ListToShow) => void
    sortInstancesBy: (filter: SupportedFilters) => void
    toggleFilterDirection: () => void
    sortStrategyChainsBy: (filter: SupportedStrategyChainsFilters) => void
    toggleStrategyChainsFilterDirection: () => void
    setInstanceDisplayMode: (mode: InstanceDisplayMode) => void
}

type AppStore = AppStoreState & AppStoreActions

export const useAppStore = create<AppStore>()(
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

            // ui
            appStoreRefreshedAt: -1,
            setAppStoreRefreshedAt: (appStoreRefreshedAt) => set(() => ({ appStoreRefreshedAt })),
            showMobileMenu: false,
            setShowMobileMenu: (showMobileMenu) => set(() => ({ showMobileMenu })),

            // unstable v1
            showActivitySection: true,
            setShowActivitySection: (showActivitySection) => set(() => ({ showActivitySection })),
            showInstancesSection: true,
            setShowInstancesSection: (showInstancesSection) => set(() => ({ showInstancesSection })),
            showStrategiesSection: true,
            setShowStrategiesSection: (showStrategiesSection) => set(() => ({ showStrategiesSection })),

            // unstable v2
            showCandlesSection: true,
            setShowCandlesSection: (showCandlesSection) => set(() => ({ showCandlesSection })),
            showInventorySection: true,
            setShowInventorySection: (showInventorySection) => set(() => ({ showInventorySection })),

            // unstable v3
            listToShow: ListToShow.STRATEGIES,
            setListToShow: (listToShow) => set(() => ({ listToShow })),

            /**
             * sorting
             */

            // instances
            instancesSortedBy: SupportedFilters.INSTANCE_STARTED,
            instancesSortedByFilterDirection: SupportedFilterDirections.DESCENDING,
            sortInstancesBy: (filter) => set(() => ({ instancesSortedBy: filter })),
            toggleFilterDirection: () =>
                set((state) => ({
                    instancesSortedByFilterDirection:
                        state.instancesSortedByFilterDirection === SupportedFilterDirections.ASCENDING
                            ? SupportedFilterDirections.DESCENDING
                            : SupportedFilterDirections.ASCENDING,
                })),

            // strategy
            strategyChainsSortedBy: SupportedStrategyChainsFilters.TRADE_COUNT,
            strategyChainsSortedByFilterDirection: SupportedFilterDirections.DESCENDING,
            sortStrategyChainsBy: (filter) => set(() => ({ strategyChainsSortedBy: filter })),
            toggleStrategyChainsFilterDirection: () =>
                set((state) => ({
                    strategyChainsSortedByFilterDirection:
                        state.strategyChainsSortedByFilterDirection === SupportedFilterDirections.ASCENDING
                            ? SupportedFilterDirections.DESCENDING
                            : SupportedFilterDirections.ASCENDING,
                })),

            /**
             * display mode
             */

            instanceDisplayMode: InstanceDisplayMode.GROUPED,
            setInstanceDisplayMode: (mode) => set(() => ({ instanceDisplayMode: mode })),
        }),
        {
            name: `${APP_METADATA.SITE_DOMAIN}-app-store-${IS_DEV ? 'dev' : 'prod'}-${env.NEXT_PUBLIC_COMMIT_TIMESTAMP}`,
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
            },
        },
    ),
)

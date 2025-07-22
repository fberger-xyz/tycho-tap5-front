'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { APP_METADATA, IS_DEV } from '@/config/app.config'
import { SupportedFilters, SupportedFilterDirections, InstanceDisplayMode } from '@/enums'
import { env } from '@/env/t3-env'
import { Strategy, ConfigurationWithInstances } from '@/types'
import { groupByStrategies } from '@/utils'

export const useAppStore = create<{
    /**
     * store
     */

    hasHydrated: boolean
    setHasHydrated: (hasHydrated: boolean) => void

    /**
     * ui
     */

    // list
    appStoreRefreshedAt: number
    setAppStoreRefreshedAt: (appStoreRefreshedAt: number) => void
    showMobileMenu: boolean
    setShowMobileMenu: (showMobileMenu: boolean) => void
    showActivitySection: boolean
    setShowActivitySection: (showActivitySection: boolean) => void
    showInstancesSection: boolean
    setShowInstancesSection: (showInstancesSection: boolean) => void
    showStrategiesSection: boolean
    setShowStrategiesSection: (showStrategiesSection: boolean) => void

    // instance
    showCandlesSection: boolean
    setShowCandlesSection: (showCandlesSection: boolean) => void
    showInventorySection: boolean
    setShowInventorySection: (showInventorySection: boolean) => void

    /**
     * instances
     */

    configurations: ConfigurationWithInstances[]
    lastInstancesFetchedAt: number

    setConfigurations: (configurations: ConfigurationWithInstances[]) => void
    setLastInstancesFetchedAt: (timestamp: number) => void

    /**
     * sorting
     */

    instancesSortedBy: SupportedFilters
    instancesSortedByFilterDirection: SupportedFilterDirections
    sortInstancesBy: (filter: SupportedFilters) => void
    toggleFilterDirection: () => void

    /**
     * display mode
     */

    instanceDisplayMode: InstanceDisplayMode
    setInstanceDisplayMode: (mode: InstanceDisplayMode) => void

    /**
     * computeds
     */

    getConfigurationsWithInstances: () => ConfigurationWithInstances[]
    getStrategies: () => Strategy[]
}>()(
    persist(
        (set, get) => ({
            /**
             * store
             */

            hasHydrated: false,
            setHasHydrated: (hasHydrated) => set(() => ({ hasHydrated })),

            /**
             * ui
             */

            // list
            appStoreRefreshedAt: -1,
            setAppStoreRefreshedAt: (appStoreRefreshedAt) => set(() => ({ appStoreRefreshedAt })),
            showMobileMenu: false,
            setShowMobileMenu: (showMobileMenu) => set(() => ({ showMobileMenu })),
            showActivitySection: true,
            setShowActivitySection: (showActivitySection) => set(() => ({ showActivitySection })),
            showInstancesSection: true,
            setShowInstancesSection: (showInstancesSection) => set(() => ({ showInstancesSection })),
            showStrategiesSection: true,
            setShowStrategiesSection: (showStrategiesSection) => set(() => ({ showStrategiesSection })),

            // instance
            showCandlesSection: true,
            setShowCandlesSection: (showCandlesSection) => set(() => ({ showCandlesSection })),
            showInventorySection: true,
            setShowInventorySection: (showInventorySection) => set(() => ({ showInventorySection })),

            /**
             * instances
             */

            configurations: [],
            lastInstancesFetchedAt: -1,
            setConfigurations: (configurations) =>
                set(() => ({
                    configurations,
                    lastInstancesFetchedAt: Date.now(),
                })),
            setLastInstancesFetchedAt: (timestamp) => set(() => ({ lastInstancesFetchedAt: timestamp })),

            /**
             * sorting
             */

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

            /**
             * display mode
             */

            instanceDisplayMode: InstanceDisplayMode.GROUPED,
            setInstanceDisplayMode: (mode) => set(() => ({ instanceDisplayMode: mode })),

            /**
             * computeds
             */

            getConfigurationsWithInstances: () => {
                return get().configurations.filter((config) => config.Instance.length > 0)
            },
            getStrategies: () => {
                return groupByStrategies(get().configurations)
            },
        }),
        {
            name: `${APP_METADATA.SITE_DOMAIN}-app-store-${IS_DEV ? 'dev' : 'prod'}-${env.NEXT_PUBLIC_COMMIT_TIMESTAMP}`,
            storage: createJSONStorage(() => localStorage),
            skipHydration: false,
            onRehydrateStorage: () => (state) => {
                if (state && !state.hasHydrated) state.setHasHydrated(true)
            },
        },
    ),
)

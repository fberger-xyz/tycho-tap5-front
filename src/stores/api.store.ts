import { create } from 'zustand'

export const useApiStore = create<{
    apiStoreRefreshedAt: number
    actions: {
        setApiStoreRefreshedAt: (apiStoreRefreshedAt: number) => void
    }
}>((set) => ({
    apiStoreRefreshedAt: -1,
    actions: {
        setApiStoreRefreshedAt: (apiStoreRefreshedAt) => set(() => ({ apiStoreRefreshedAt })),
    },
}))

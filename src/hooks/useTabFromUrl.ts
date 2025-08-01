'use client'

import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { ListToShow } from '@/enums'

// Map URL values to ListToShow enum
const TAB_URL_VALUES = {
    strategies: ListToShow.STRATEGIES,
    trades: ListToShow.TRADES,
} as const

type TabUrlValue = keyof typeof TAB_URL_VALUES

// Create parser with valid tab values
const tabParser = parseAsStringLiteral(Object.keys(TAB_URL_VALUES) as [TabUrlValue, ...TabUrlValue[]])

export function useTabFromUrl() {
    const [urlTab, setUrlTab] = useQueryState('tab', tabParser.withDefault('strategies'))

    // Get the enum value from URL value
    const tab = TAB_URL_VALUES[urlTab]

    // Helper to set tab by ListToShow enum value
    const setTab = (listToShow: ListToShow) => {
        const urlValue = Object.entries(TAB_URL_VALUES).find(([, value]) => value === listToShow)?.[0] as TabUrlValue | undefined
        if (urlValue) {
            setUrlTab(urlValue)
        }
    }

    return {
        tab,
        setTab,
        urlTab,
        setUrlTab,
    }
}

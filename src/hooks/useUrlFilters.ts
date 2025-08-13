'use client'

import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { useEffect } from 'react'
import { AppSupportedChainIds } from '@/enums/app.enum'
import { getTokenBySymbol } from '@/config/tokens.config'

export interface UrlFilters {
    chains: string[]
    pairs: string[]
    teams: string
}

// Default values
const DEFAULT_CHAINS = [CHAINS_CONFIG[AppSupportedChainIds.ETHEREUM].oneInchId]
const DEFAULT_PAIRS = [
    `${getTokenBySymbol(AppSupportedChainIds.ETHEREUM, 'WETH')?.symbol}-${getTokenBySymbol(AppSupportedChainIds.ETHEREUM, 'USDC')?.symbol}`,
].map((p) => p.toLowerCase())
const DEFAULT_TEAMS = 'tycho'

// Valid values for validation
const VALID_CHAIN_IDS = Object.values(CHAINS_CONFIG)
    .filter((chain) => chain.supported)
    .map((chain) => chain.oneInchId.toLowerCase())

const VALID_TEAMS = ['tycho'] // Add more teams as they become available

// Define the parser for each filter
const filtersParser = {
    chains: parseAsArrayOf(parseAsString, ',').withDefault([]),
    pairs: parseAsArrayOf(parseAsString, ',').withDefault([]),
    teams: parseAsString.withDefault(''),
}

export function useUrlFilters() {
    const [filters, setFilters] = useQueryStates(filtersParser, {
        shallow: false,
        history: 'replace',
    })

    // Validate and set defaults if no filters are provided
    useEffect(() => {
        let needsUpdate = false
        const updates: Partial<UrlFilters> = {}

        // Validate chains
        const validChains = filters.chains.filter((chain) => chain === 'all' || VALID_CHAIN_IDS.includes(chain.toLowerCase()))
        if (validChains.length !== filters.chains.length) {
            needsUpdate = true
            updates.chains = validChains
        }

        // Validate pairs - ensure they have valid format
        const validPairs = filters.pairs.filter((pair) => {
            if (pair === 'all') return true
            const parts = pair.toLowerCase().split(/[-\/]/)
            return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
        })
        if (validPairs.length !== filters.pairs.length) {
            needsUpdate = true
            updates.pairs = validPairs
        }

        // Validate teams
        if (filters.teams && !VALID_TEAMS.includes(filters.teams.toLowerCase())) {
            needsUpdate = true
            updates.teams = ''
        }

        // Check if we have no filters after validation
        const hasNoFilters =
            (updates.chains || filters.chains).length === 0 &&
            (updates.pairs || filters.pairs).length === 0 &&
            (updates.teams || filters.teams) === ''

        if (hasNoFilters) {
            // Set defaults - use setTimeout to avoid update during render
            const timeoutId = setTimeout(() => {
                setFilters({
                    chains: DEFAULT_CHAINS,
                    pairs: DEFAULT_PAIRS,
                    teams: DEFAULT_TEAMS,
                })
            }, 0)
            return () => clearTimeout(timeoutId)
        } else if (needsUpdate) {
            // Apply validation updates - use setTimeout to avoid update during render
            const timeoutId = setTimeout(() => {
                setFilters((prev) => ({ ...prev, ...updates }))
            }, 0)
            return () => clearTimeout(timeoutId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.chains, filters.pairs, filters.teams]) // setFilters excluded intentionally to prevent loops

    // Helper function to get chain IDs from chain names
    const getChainIdsFromNames = (chainNames: string[]): number[] => {
        // If empty array or contains 'all', return empty array (which means all chains)
        if (!chainNames.length || chainNames.includes('all')) return []

        return Object.values(CHAINS_CONFIG)
            .filter((chain) =>
                chainNames.some((name) => {
                    const normalizedName = name.toLowerCase()
                    // Support oneInchId values
                    return chain.oneInchId.toLowerCase() === normalizedName
                }),
            )
            .map((chain) => chain.id)
    }

    // Helper to check if instance matches filters
    const matchesFilters = (instance: { chainId: number; baseSymbol: string; quoteSymbol: string }): boolean => {
        // Teams filter (always passes for now since we only support 'tycho')
        if (filters.teams && filters.teams !== 'tycho') return false

        // Chain filter - if empty or contains 'all', show all chains
        if (filters.chains.length > 0 && !filters.chains.includes('all')) {
            const chainIds = getChainIdsFromNames(filters.chains)
            if (!chainIds.includes(instance.chainId)) return false
        }

        // Pairs filter - if empty or contains 'all', show all pairs
        if (filters.pairs.length > 0 && !filters.pairs.includes('all')) {
            const hasMatchingPair = filters.pairs.some((pair) => {
                // Normalize pair format (support both - and / separators)
                const [base, quote] = pair.toLowerCase().split(/[-\/]/)
                const instanceBase = instance.baseSymbol.toLowerCase()
                const instanceQuote = instance.quoteSymbol.toLowerCase()

                // Check both directions
                return (base === instanceBase && quote === instanceQuote) || (base === instanceQuote && quote === instanceBase)
            })

            if (!hasMatchingPair) return false
        }

        return true
    }

    // Check if filters are effectively showing all
    const isShowingAll = () => {
        return (filters.chains.length === 0 || filters.chains.includes('all')) && (filters.pairs.length === 0 || filters.pairs.includes('all'))
    }

    // Helper to update a specific filter
    const updateFilter = <K extends keyof UrlFilters>(key: K, value: UrlFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    // Helper to clear all filters
    const clearFilters = () => {
        setFilters({
            chains: [],
            pairs: [],
            teams: '',
        })
    }

    // Helper to toggle a value in array filters
    const toggleArrayFilter = (key: 'chains' | 'pairs', value: string) => {
        setFilters((prev) => {
            const currentValues = prev[key] as string[]
            const newValues = currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value]
            return { ...prev, [key]: newValues }
        })
    }

    // Get list of valid chains for UI
    const getValidChains = () => VALID_CHAIN_IDS

    // Get list of valid teams for UI
    const getValidTeams = () => VALID_TEAMS

    // Validate a single filter value
    const isValidFilter = (type: 'chains' | 'pairs' | 'teams', value: string): boolean => {
        switch (type) {
            case 'chains':
                return value === 'all' || VALID_CHAIN_IDS.includes(value.toLowerCase())
            case 'pairs':
                if (value === 'all') return true
                const parts = value.toLowerCase().split(/[-\/]/)
                return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
            case 'teams':
                return VALID_TEAMS.includes(value.toLowerCase())
            default:
                return false
        }
    }

    return {
        filters,
        setFilters,
        updateFilter,
        clearFilters,
        toggleArrayFilter,
        matchesFilters,
        getChainIdsFromNames,
        isShowingAll,
        getValidChains,
        getValidTeams,
        isValidFilter,
    }
}

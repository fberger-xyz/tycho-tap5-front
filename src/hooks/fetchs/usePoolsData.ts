import { useQuery } from '@tanstack/react-query'
import { AmmAsOrderbook, AmmPool } from '@/interfaces'
import { createRequest } from '@/utils/requests.util'

interface UsePoolsDataParams {
    chain: string
    token0: string
    token1: string
    pointToken?: string
    pointAmount?: number
    enabled?: boolean
}

export function usePoolsData(params?: UsePoolsDataParams) {
    const fetchOrderbook = async (): Promise<AmmAsOrderbook | null> => {
        if (!params?.chain || !params?.token0 || !params?.token1) {
            return null
        }

        const searchParams = new URLSearchParams({
            chain: params.chain,
            token0: params.token0,
            token1: params.token1,
        })

        if (params.pointToken && params.pointAmount !== undefined) {
            searchParams.append('pointToken', params.pointToken)
            searchParams.append('pointAmount', params.pointAmount.toString())
        }

        const url = `/api/orderbook?${searchParams.toString()}`
        console.log('Fetching orderbook from:', url)

        const result = await createRequest<AmmAsOrderbook>(url)

        console.log('Orderbook API response:', result)

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch orderbook data')
        }

        return result.data || null
    }

    return useQuery({
        queryKey: ['orderbook', params?.chain, params?.token0, params?.token1, params?.pointToken, params?.pointAmount],
        queryFn: fetchOrderbook,
        enabled: params?.enabled !== false && !!params?.chain && !!params?.token0 && !!params?.token1,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 20000, // Consider data stale after 20 seconds
    })
}

// Mock data for development
export function useMockPoolsData() {
    return useQuery({
        queryKey: ['pools-mock'],
        queryFn: async () => {
            // Simulating API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            return [
                {
                    address: '0x1234567890123456789012345678901234567890',
                    id: 'uniswap-v3-1',
                    protocol_system: 'uniswap_v3',
                    protocol_type_name: 'Uniswap v3',
                    fee: 0.003,
                    last_updated_at: Date.now() - 5 * 60 * 1000,
                    tokens: [],
                    contract_ids: [],
                    static_attributes: [],
                    creation_tx: '',
                },
                {
                    address: '0x2345678901234567890123456789012345678901',
                    id: 'balancer-v2-1',
                    protocol_system: 'balancer_v2',
                    protocol_type_name: 'Balancer v2',
                    fee: 0.003,
                    last_updated_at: Date.now() - 5 * 60 * 1000,
                    tokens: [],
                    contract_ids: [],
                    static_attributes: [],
                    creation_tx: '',
                },
                {
                    address: '0x3456789012345678901234567890123456789012',
                    id: 'curve-1',
                    protocol_system: 'curve',
                    protocol_type_name: 'Curve',
                    fee: 0.003,
                    last_updated_at: Date.now() - 5 * 60 * 1000,
                    tokens: [],
                    contract_ids: [],
                    static_attributes: [],
                    creation_tx: '',
                },
                {
                    address: '0x4567890123456789012345678901234567890123',
                    id: 'balancer-v2-2',
                    protocol_system: 'balancer_v2',
                    protocol_type_name: 'Balancer v2',
                    fee: 0.003,
                    last_updated_at: Date.now() - 5 * 60 * 1000,
                    tokens: [],
                    contract_ids: [],
                    static_attributes: [],
                    creation_tx: '',
                },
            ] as AmmPool[]
        },
        staleTime: 30000,
        refetchInterval: 30000,
    })
}

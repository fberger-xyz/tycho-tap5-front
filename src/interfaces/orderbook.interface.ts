// pool types - kept for PoolLink component

export interface Token {
    address: string
    decimals: number
    symbol: string
    gas: string
}

export interface AmmPool {
    address: string
    id: string
    tokens: Token[]
    protocol_system: string
    protocol_type_name: string
    contract_ids: string[]
    static_attributes: string[][]
    creation_tx: string
    fee: number
    last_updated_at: number
}

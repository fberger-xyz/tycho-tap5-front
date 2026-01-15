export interface PaginationParams {
    limit: number
    skip: number
}

export interface ParsedPaginationParams extends PaginationParams {
    error?: string
}

export const parsePaginationParams = (searchParams: URLSearchParams): ParsedPaginationParams => {
    const limit = parseInt(searchParams.get('limit') || '500')
    const skip = parseInt(searchParams.get('skip') || '0')

    if (limit < 1 || limit > 1000) {
        return { limit: 500, skip: 0, error: 'Invalid limit parameter. Must be between 1 and 1000.' }
    }

    if (skip < 0) {
        return { limit, skip: 0, error: 'Invalid skip parameter. Must be non-negative.' }
    }

    return { limit, skip }
}

import { unstable_cache } from 'next/cache'

export interface CacheConfig {
    tags?: string[]
    revalidate?: number // seconds
}

/**
 * Creates a cached version of an async function using Next.js unstable_cache
 * @param fn - The async function to cache
 * @param keyParts - Array of strings to create a unique cache key
 * @param config - Cache configuration
 */
export function createCachedFunction<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    keyParts: string[],
    config: CacheConfig = {},
): (...args: TArgs) => Promise<TReturn> {
    const { tags = [], revalidate = 30 } = config

    return unstable_cache(fn, keyParts, {
        tags,
        revalidate,
    }) as (...args: TArgs) => Promise<TReturn>
}

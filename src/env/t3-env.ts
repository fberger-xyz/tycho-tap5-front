import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here.
     * This way you can ensure the app isn't built with invalid env vars.
     */

    server: {
        // Database
        DATABASE_URL: z.string().url(),

        // OneInch
        ONEINCH_API_KEY: z.string().min(1),

        // rpc
        INFURA_API_KEY: z.string().optional(),
        ALCHEMY_API_KEY: z.string().optional(),

        // debank
        DEBANK_ACCESS_KEY: z.string().min(1),

        // logging
        LOG: z.string().optional(),
    },

    /**
     * Specify your client-side environment variables schema here.
     * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
     */

    client: {
        NEXT_PUBLIC_COMMIT_TIMESTAMP: z.string().optional(),
        NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
        NEXT_PUBLIC_LOG: z.string().optional(),
    },

    /**
     * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
     */

    runtimeEnv: {
        // Server
        DATABASE_URL: process.env.DATABASE_URL,
        ONEINCH_API_KEY: process.env.ONEINCH_API_KEY,
        INFURA_API_KEY: process.env.INFURA_API_KEY,
        ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
        DEBANK_ACCESS_KEY: process.env.DEBANK_ACCESS_KEY,
        LOG: process.env.LOG,

        // Client
        NEXT_PUBLIC_COMMIT_TIMESTAMP: process.env.NEXT_PUBLIC_COMMIT_TIMESTAMP,
        NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        NEXT_PUBLIC_LOG: process.env.NEXT_PUBLIC_LOG,
    },

    emptyStringAsUndefined: true,
})

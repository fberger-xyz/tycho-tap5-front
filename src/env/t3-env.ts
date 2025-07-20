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
    },

    /**
     * Specify your client-side environment variables schema here.
     * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
     */

    client: {
        NEXT_PUBLIC_APP_URL: z.string().min(1),
        NEXT_PUBLIC_COMMIT_TIMESTAMP: z.string().optional(),
        NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
    },

    /**
     * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
     */

    runtimeEnv: {
        // Server
        DATABASE_URL: process.env.DATABASE_URL,
        ONEINCH_API_KEY: process.env.ONEINCH_API_KEY,

        // Client
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_COMMIT_TIMESTAMP: process.env.NEXT_PUBLIC_COMMIT_TIMESTAMP,
        NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    },

    emptyStringAsUndefined: true,
})

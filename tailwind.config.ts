import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            fontFamily: {
                inter: ['var(--font-inter)', 'sans-serif'],
                'inter-tight': ['var(--font-inter-tight)', 'sans-serif'],
            },
            colors: {
                background: 'hsl(var(--color-background) / <alpha-value>)',
                jagger: {
                    DEFAULT: 'hsl(var(--color-jagger) / <alpha-value>)',
                    800: 'hsl(var(--color-jagger-800) / <alpha-value>)',
                    500: 'hsl(var(--color-jagger-500) / <alpha-value>)',
                    400: 'hsl(var(--color-jagger-400) / <alpha-value>)',
                    300: 'hsl(var(--color-jagger-300) / <alpha-value>)',
                    200: 'hsl(var(--color-jagger-200) / <alpha-value>)',
                },
                folly: 'hsl(var(--color-folly) / <alpha-value>)',
                aquamarine: 'hsl(var(--color-aquamarine) / <alpha-value>)',
                milk: {
                    DEFAULT: 'hsl(var(--color-milk) / <alpha-value>)',
                    600: 'hsl(var(--color-milk-600))',
                    400: 'hsl(var(--color-milk-400))',
                    200: 'hsl(var(--color-milk-200))',
                    150: 'hsl(var(--color-milk-150))',
                    100: 'hsl(var(--color-milk-100))',
                    50: 'hsl(var(--color-milk-50))',
                },
            },
            animation: {
                'skeleton-move': 'skeleton-move 2s infinite',
                flash: 'flash 0.8s ease-in-out',
            },
            keyframes: {
                'skeleton-move': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
        },
    },
    plugins: [],
}

export default config

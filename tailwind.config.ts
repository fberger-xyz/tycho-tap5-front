import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            fontFamily: {
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            colors: {
                background: 'hsl(var(--color-background) / <alpha-value>)',
                primary: 'hsl(var(--color-primary) / <alpha-value>)',
                default: 'hsl(var(--color-default) / <alpha-value>)',
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

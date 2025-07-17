import { AppThemes } from '@/enums/app.enum'
import { IconIds } from '@/enums/icons.enum'
import { FileIds } from '@/enums/files.enum'
import { Inter, Inter_Tight } from 'next/font/google'
import resolveConfig from 'tailwindcss/resolveConfig'
import type { Config } from 'tailwindcss'
import tailwindConfig from '../../tailwind.config'
import { DefaultColors } from 'tailwindcss/types/generated/colors'

export const APP_THEMES = {
    [AppThemes.LIGHT]: { index: 0, iconId: IconIds.THEME_LIGHT, svgId: FileIds.THEME_LIGHT },
    [AppThemes.DARK]: { index: 1, iconId: IconIds.THEME_DARK, svgId: FileIds.THEME_DARK },
} as const

/**
 * fonts
 */

export const INTER_FONT = Inter({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    preload: true,
})

export const INTER_TIGHT_FONT = Inter_Tight({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-inter-tight',
})

/**
 * tailwind
 */

const fullConfig = resolveConfig(tailwindConfig as Config)
export const AppColors = fullConfig.theme.colors as DefaultColors & {
    background: string
    primary: string
    default: string
}

/**
 * toast
 */

export const toastStyle = {
    borderRadius: '10px',
    background: AppColors.blue[800],
    borderColor: AppColors.blue[300],
    border: 2,
    color: AppColors.blue[300],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '800px',
} as const

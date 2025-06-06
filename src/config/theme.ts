import { AppThemes } from '@/enums/app.enum'
import { IconIds } from '@/enums/icons.enum'
import { FileIds } from '@/enums/files.enum'

export const APP_THEMES = {
    [AppThemes.LIGHT]: { index: 0, iconId: IconIds.THEME_LIGHT, svgId: FileIds.THEME_LIGHT },
    [AppThemes.DARK]: { index: 1, iconId: IconIds.THEME_DARK, svgId: FileIds.THEME_DARK },
} as const

import { cn } from '@/utils'
import { forwardRef } from 'react'

export function Button({ children, className, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                'flex items-center justify-center',
                'gap-2', // 8px
                'bg-milk-50',
                'rounded-[8px]',
                'transition-colors duration-200',
                'hover:bg-milk-100',
                className,
            )}
            style={{
                width: 36,
                height: 38,
                opacity: 1,
                paddingTop: 8,
                paddingRight: 8,
                paddingBottom: 10,
                paddingLeft: 8,
                boxShadow: [
                    '0px -1.92px 0px 0px #080808 inset',
                    '0px 0.64px 0px 0px #FFFFFF4D inset',
                    '0px 1.77px 1.41px 0px #0000001F',
                    '0px 4.25px 3.4px 0px #00000021',
                    '0px 8px 6.4px 0px #00000022',
                    '0px 14.28px 11.42px 0px #00000024',
                    '0px 1.92px 1.92px 0px #00000024',
                    '0px 1.77px 1.41px 0px #0000001F',
                ].join(', '),
                ...(style || {}),
            }}
            {...props}
        >
            {children}
        </button>
    )
}

export function ButtonDanger({ children, className, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                'flex flex-row items-center justify-center',
                'gap-1', // 4px
                'rounded-[12px]',
                'border-[3px] border-black',
                'flex-none',
                'transition-all duration-200 ease-in-out',
                className,
            )}
            style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px 16px 10px 12px',
                gap: '4px',
                width: 143,
                height: 40,
                background: 'linear-gradient(360deg, #4B1A26 0%, #2B030D 100%)',
                border: '3px solid #000000',
                borderRadius: '12px',
                boxShadow: [
                    '0px -1px 1px rgba(255, 255, 255, 0.14)',
                    '0px 5px 7px rgba(0, 0, 0, 0.24)',
                    '0px 5px 14px rgba(0, 0, 0, 0.25)',
                    'inset 0px 1px 1px 0.25px rgba(255, 255, 255, 0.2)',
                ].join(', '),
                flex: 'none',
                order: 0,
                flexGrow: 0,
                ...(style || {}),
            }}
            {...props}
        >
            {children}
        </button>
    )
}

interface ButtonDarkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean
}

export const ButtonDark = forwardRef<HTMLButtonElement, ButtonDarkProps>(({ children, className, style, selected = false, ...props }, ref) => {
    const getBackgroundGradient = () => {
        if (selected) {
            return 'linear-gradient(180deg, #1B1919 0%, #222222 100%)'
        }
        return 'linear-gradient(180deg, #1B1919 0%, #2C2C2C 100%)'
    }

    const getHoverBackgroundGradient = () => {
        if (selected) {
            return 'linear-gradient(180deg, #070505 0%, #181818 100%)'
        }
        return 'linear-gradient(180deg, #110F0F 0%, #2C2C2C 100%)'
    }

    const getBoxShadow = () => {
        if (selected) {
            // Add a subtle glow effect for selected state
            return [
                '0px -1px 1px rgba(255, 255, 255, 0.14)',
                '0px 0px 8px rgba(255, 244, 224, 0.15)', // Subtle milk color glow
                'inset 0px 1px 1px 0.25px rgba(255, 244, 224, 0.3)', // Inner highlight
            ].join(', ')
        }
        return [
            '0px -1px 1px rgba(255, 255, 255, 0.14)',
            '0px 5px 7px rgba(0, 0, 0, 0.24)',
            '0px 5px 14px rgba(0, 0, 0, 0.25)',
            'inset 0px 1px 1px 0.25px rgba(255, 255, 255, 0.2)',
        ].join(', ')
    }

    // Add transition for background and box-shadow
    const transition = 'background 0.5s ease-in-out, box-shadow 0.3s ease-in-out'

    return (
        <button
            ref={ref}
            className={cn(
                'flex w-fit flex-row items-center justify-center',
                'border-[3px] border-black',
                'text-sm font-medium leading-5 text-milk',
                'rounded-[12px]',
                'transition-all duration-200 ease-in-out',
                'relative', // Add relative positioning for pseudo-element
                className,
            )}
            style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: selected ? '8px' : '4px',
                background: getBackgroundGradient(),
                border: '3px solid #000000',
                borderRadius: '12px',
                boxShadow: getBoxShadow(),
                transition,
                position: 'relative',
                ...(style || {}),
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transition = transition
                e.currentTarget.style.background = getHoverBackgroundGradient()
                props.onMouseEnter?.(e)
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transition = transition
                e.currentTarget.style.background = getBackgroundGradient()
                props.onMouseLeave?.(e)
            }}
            {...props}
        >
            {/* Add a subtle flashy background effect for selected state */}
            {selected && (
                <div
                    className="pointer-events-none absolute inset-0 z-0 animate-pulse rounded-[9px]"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(255, 244, 224, 0.08) 0%, transparent 70%)',
                    }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    )
})
ButtonDark.displayName = 'ButtonDark'

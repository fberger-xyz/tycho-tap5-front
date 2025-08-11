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
                    'inset 0px 1px 1px 3px rgba(255, 255, 255, 0.2)',
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

export const ButtonDark = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, className = 'px-[14px] py-[7px] rounded-xl', ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                'w-max flex items-center justify-center hover:bg-milk-50 bg-[#2C2C2C] transition-all duration-200 ease-in-out',
                'border-[3px] border-black',
                'text-milk font-medium text-sm leading-5',
                'hover:shadow-lg active:scale-95',
                'shadow-[0px_5px_14px_0px_rgba(0,0,0,0.25),0px_5px_7px_0px_rgba(0,0,0,0.24),0px_-1px_1px_0px_rgba(255,255,255,0.14),inset_0px_1px_1px_1px_rgba(255,255,255,0.2)]',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    ),
)
ButtonDark.displayName = 'ButtonDark'

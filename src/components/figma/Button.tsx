import { cn } from '@/utils'

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
                'flex items-center justify-center',
                'gap-1', // 4px
                'transition-colors duration-200',
                'rounded-[8.95px]',
                'text-folly',
                className,
            )}
            style={{
                width: 141,
                height: 38,
                gap: '4px',
                opacity: 1,
                borderRadius: 8.95,
                paddingTop: 8,
                paddingRight: 16,
                paddingBottom: 10,
                paddingLeft: 10,
                background: [
                    'linear-gradient(0deg, #3D151F, #3D151F)',
                    'radial-gradient(62.56% 62.56% at 28.14% -10.42%, rgba(255, 83, 126, 0.1) 0%, rgba(61, 21, 31, 0.1) 100%)',
                ].join(', '),
                boxShadow: [
                    '0px -1.92px 0px 0px #080808 inset',
                    '0px 0.64px 0px 0px #FF8BA84D inset',
                    '0px 1.77px 1.41px 0px #0000001F',
                    '0px 4.25px 3.4px 0px #00000021',
                    '0px 8px 6.4px 0px #00000022',
                    '0px 14.28px 11.42px 0px #00000024',
                    '0px 26.7px 21.36px 0px #00000026',
                    '0px 63.91px 51.13px 0px #00000026',
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

export function ButtonDark({ children, className, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                'flex items-center justify-center hover:bg-milk-50 bg-[#2C2C2C] transition-all duration-200 ease-in-out',
                'border-[3px] border-black rounded-xl',
                'text-milk font-medium text-sm leading-5',
                'hover:shadow-lg active:scale-95',
                'shadow-[0px_5px_14px_0px_rgba(0,0,0,0.25),0px_5px_7px_0px_rgba(0,0,0,0.24),0px_-1px_1px_0px_rgba(255,255,255,0.14),inset_0px_1px_1px_1px_rgba(255,255,255,0.2)]',
                className,
            )}
            style={{
                padding: '7px 14px',
                ...(style || {}),
            }}
            {...props}
        >
            {children}
        </button>
    )
}

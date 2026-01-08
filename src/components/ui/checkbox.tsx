import * as React from 'react'
import { cn } from '@/utils/cn.util'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked)
            props.onChange?.(e)
        }

        return (
            <input
                type="checkbox"
                ref={ref}
                className={cn(
                    'h-4 w-4 rounded border border-jagger-400/50 bg-transparent text-milk-400 focus:ring-2 focus:ring-jagger-400/50 focus:ring-offset-0',
                    className
                )}
                onChange={handleChange}
                {...props}
            />
        )
    }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
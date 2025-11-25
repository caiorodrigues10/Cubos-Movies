import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = 'primary', className, children, ...props }, ref) => {
		const baseStyles = 'btn'

		const variants = {
			primary:
				'bg-primary text-white hover:bg-[#9A5CD0] active:bg-[#9A5CD0] disabled:bg-[#6F6D78] disabled:text-[#ECE9FD7D]',
			secondary:
				'bg-[#B744F740] dark:bg-[#B744F714] text-white hover:bg-[#C150FF50] dark:hover:bg-[#C150FF2E] active:bg-[#B412F920] dark:active:bg-[#B412F90A] disabled:bg-[#EBEAF840] dark:disabled:bg-[#EBEAF814] disabled:text-[#ECE9FD7D]',
		}

		return (
			<button
				ref={ref}
				className={cn(
					baseStyles,
					variants[variant],
					className,
					'cursor-pointer h-[44px] px-5! text-base rounded-[2px]',
				)}
				{...props}
			>
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'

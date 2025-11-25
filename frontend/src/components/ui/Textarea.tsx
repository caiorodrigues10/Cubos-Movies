import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface TextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, error, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					'flex min-h-[120px] w-full rounded-md border bg-[#1A191B] border-[#3C393F] px-3 py-2 text-base placeholder:text-[#6F6D78] outline-none transition-all',
					'focus:border-[--color-primary] focus:ring-1 focus:ring-[--color-primary]',
					error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
					className,
				)}
				{...props}
			/>
		)
	},
)
Textarea.displayName = 'Textarea'

'use client'

import {
	forwardRef,
	type SelectHTMLAttributes,
	type HTMLAttributes,
	type LabelHTMLAttributes,
	useEffect,
	useState,
} from 'react'
import { useTheme } from 'next-themes'
import { cn } from '../../lib/utils'
import Image from 'next/image'

export function SelectRoot({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('flex flex-col gap-2', className)} {...props}>
			{children}
		</div>
	)
}

export function SelectContainer({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('flex flex-col', className)} {...props}>
			{children}
		</div>
	)
}

export function SelectLabel({
	className,
	children,
	...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		<label
			className={cn('text-xs font-bold leading-none', className)}
			{...props}
		>
			{children}
		</label>
	)
}

export function SelectControl({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('relative', className)} {...props}>
			{children}
		</div>
	)
}

export interface SelectErrorProps extends HTMLAttributes<HTMLSpanElement> {
	error?: boolean
	errorMessage?: string
}
export function SelectError({
	error,
	errorMessage,
	className,
	children,
	...props
}: SelectErrorProps) {
	const message = errorMessage || (typeof children === 'string' ? children : '')
	if (!error && !message) return null
	return (
		<span className={cn('mt-1 text-sm text-red-600', className)} {...props}>
			{message}
		</span>
	)
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ className, error, children, style, ...props }, ref) => {
		const { theme, resolvedTheme } = useTheme()
		const [mounted, setMounted] = useState(false)

		useEffect(() => {
			const timer = requestAnimationFrame(() => {
				setMounted(true)
			})
			return () => cancelAnimationFrame(timer)
		}, [])

		const currentTheme = theme ?? resolvedTheme ?? 'dark'
		const isDark = currentTheme === 'dark'
		const backgroundColor = mounted
			? isDark
				? '#1A191B'
				: '#ffffff'
			: '#1A191B'

		return (
			<div className="relative">
				<select
					ref={ref}
					className={cn(
						'w-full appearance-none rounded-md border border-[#3C393F] px-5 py-2 text-base placeholder:text-[#6F6D78] outline-none transition-all',
						'h-[44px]',
						'focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
						error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
						className,
					)}
					style={{
						backgroundColor,
						...style,
					}}
					{...props}
				>
					{children}
				</select>
				<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
					<Image
						src="/images/Chevron Down.svg"
						alt="Seta para baixo"
						width={16}
						height={16}
						className="opacity-60 invert"
					/>
				</div>
			</div>
		)
	},
)
Select.displayName = 'Select'


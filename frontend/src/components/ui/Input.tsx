'use client'

import {
	forwardRef,
	type HTMLAttributes,
	type InputHTMLAttributes,
	type LabelHTMLAttributes,
	useEffect,
	useState,
} from 'react'
import { useTheme } from 'next-themes'
import { cn } from '../../lib/utils'

export function InputRoot({
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

export function InputContainer({
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

export function InputLabel({
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

export function InputControl({
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

export interface InputIconProps extends HTMLAttributes<HTMLDivElement> {
	position?: 'start' | 'end'
	interactive?: boolean
}
export function InputIcon({
	position = 'start',
	interactive = false,
	className,
	children,
	...props
}: InputIconProps) {
	const sideClass = position === 'start' ? 'left-3' : 'right-3'
	return (
		<div
			className={cn(
				'absolute top-1/2 -translate-y-1/2 text-[--color-muted-foreground]',
				sideClass,
				!interactive && 'pointer-events-none',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export interface InputErrorProps extends HTMLAttributes<HTMLSpanElement> {
	error?: boolean
	errorMessage?: string
}
export function InputError({
	error,
	errorMessage,
	className,
	children,
	...props
}: InputErrorProps) {
	const message = errorMessage || (typeof children === 'string' ? children : '')
	if (!error && !message) return null
	return (
		<span className={cn('mt-1 text-sm text-red-600', className)} {...props}>
			{message}
		</span>
	)
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean
	withStartIcon?: boolean
	withEndIcon?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, error, withStartIcon, withEndIcon, style, ...props }, ref) => {
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
			<input
				ref={ref}
				className={cn(
					'input-base',
					withStartIcon && 'pl-12!',
					withEndIcon && 'pr-12!',
					error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
					'h-[44px] px-5! text-base border border-[#3C393F]! placeholder:text-[#6F6D78]',
					className,
				)}
				style={{
					backgroundColor,
					...style,
				}}
				{...props}
			/>
		)
	},
)
Input.displayName = 'Input'

'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { useTheme } from 'next-themes'

interface InfoItemProps {
	label: string
	value: ReactNode
	className?: string
}

export function InfoItem({ label, value, className }: InfoItemProps) {
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	return (
		<div
			className={cn(
				'p-4 rounded-[4px] flex flex-col gap-2 justify-center h-full min-h-[80px] backdrop-blur-sm w-full',
				isDark
					? 'bg-[#232225bf] border border-[#ffffff08]'
					: 'bg-white/80 border border-neutral-400',
				className,
			)}
		>
			<span
				className={cn(
					"block font-['Montserrat'] text-[12px] font-bold uppercase leading-[100%]",
					isDark ? 'text-[#B5B2BC]' : 'text-[--color-muted-foreground]',
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"font-['Montserrat'] text-[14px] font-bold leading-[100%]",
					isDark ? 'text-[#EEEEF0]' : 'text-[--color-foreground]',
				)}
			>
				{value}
			</span>
		</div>
	)
}

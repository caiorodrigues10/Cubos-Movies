'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface InfoItemProps {
	label: string
	value: ReactNode
	className?: string
}

export function InfoItem({ label, value, className }: InfoItemProps) {
	return (
		<div
			className={cn(
				'p-4 rounded-[4px] flex flex-col gap-2 justify-center h-full bg-white/80 border-neutral-400 min-h-[80px] backdrop-blur-sm w-full dark:bg-[#232225bf] border dark:border-[#ffffff08]',
				className,
			)}
		>
			<span
				className={cn(
					"block font-['Montserrat'] text-[12px] font-bold uppercase leading-[100%] dark:text-[#B5B2BC] text-black",
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"font-['Montserrat'] text-[14px] font-bold leading-[100%] dark:text-[#EEEEF0] text-[--color-foreground]",
				)}
			>
				{value}
			</span>
		</div>
	)
}

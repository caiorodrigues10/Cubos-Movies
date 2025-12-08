'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const timer = requestAnimationFrame(() => {
			setMounted(true)
		})
		return () => cancelAnimationFrame(timer)
	}, [])

	const current = theme ?? resolvedTheme
	const isDark = current === 'dark'

	return (
		<Button
			variant="secondary"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className={className}
		>
			{mounted && (
				<Image
					src={isDark ? '/images/Sun.svg' : '/images/Moon.svg'}
					alt={isDark ? 'Sun' : 'Moon'}
					width={16}
					height={16}
					className="h-4 w-4"
					style={{
						filter: 'invert(1)',
					}}
				/>
			)}
		</Button>
	)
}

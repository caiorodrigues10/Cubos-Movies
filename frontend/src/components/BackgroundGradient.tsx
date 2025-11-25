'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function BackgroundGradient() {
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

	const darkGradient =
		'linear-gradient(180deg, #121113 0%, rgba(18, 17, 19, 0.46) 49.48%, #121113 100%)'
	const lightGradient =
		'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 49.48%, rgba(255, 255, 255, 1) 80%)'

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 z-10"
			style={{
				background: mounted
					? isDark
						? darkGradient
						: lightGradient
					: darkGradient,
				opacity: 1,
			}}
		/>
	)
}

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Footer() {
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

	return (
		<footer
			className="flex min-h-[68px] flex-col sm:flex-row items-center justify-center text-center py-4 sm:py-0 px-4"
			style={{
				borderTop: isDark ? '1px solid #F1E6FD30' : '1px solid rgba(0, 0, 0, 0.1)',
				fontFamily: 'var(--font-montserrat), sans-serif',
				fontSize: '16px',
				fontWeight: 400,
				lineHeight: '1.5',
				letterSpacing: '0px',
				color: mounted ? (isDark ? '#B5B2BC' : '#4A4A4A') : '#B5B2BC',
				backgroundColor: mounted ? (isDark ? 'transparent' : '#ffffff') : 'transparent',
			}}
		>
			<span>2025 © Todos os direitos reservados a&nbsp;</span>
			<span className="hidden sm:inline">&nbsp;</span>
			<span style={{ fontWeight: 600 }}>Cubos Movies</span>
		</footer>
	)
}


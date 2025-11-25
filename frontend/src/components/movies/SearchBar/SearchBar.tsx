'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Input, InputControl, InputIcon } from '@/components/ui/Input'
import { useTheme } from 'next-themes'

export function SearchBar() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const initial = searchParams.get('name') ?? ''
	const [value, setValue] = useState(initial)
	const timeoutRef = useRef<number | null>(null)
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const isDark = resolvedTheme === 'dark'

	useEffect(() => {
		const timer = requestAnimationFrame(() => {
			setMounted(true)
		})
		return () => cancelAnimationFrame(timer)
	}, [])

	function push(val: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (val) params.set('name', val)
		else params.delete('name')
		params.delete('page')
		router.push('?' + params.toString())
	}

	return (
		<InputControl className="w-full">
			<InputIcon position="end">
				{mounted && (
					<Image
						src="/images/Search.svg"
						alt="Buscar"
						width={20}
						height={20}
						className="opacity-60"
						style={{
							filter: isDark ? 'invert(1)' : 'none',
						}}
					/>
				)}
				{!mounted && (
					<Image
						src="/images/Search.svg"
						alt="Buscar"
						width={20}
						height={20}
						className="opacity-60"
					/>
				)}
			</InputIcon>
			<Input
				type="search"
				placeholder="Pesquise por filmes"
				value={value}
				withEndIcon
				onChange={(e) => {
					setValue(e.target.value)
					if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
					timeoutRef.current = window.setTimeout(
						() => push(e.target.value),
						300,
					)
				}}
			/>
		</InputControl>
	)
}

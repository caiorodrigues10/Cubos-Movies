'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
	title: string
}

export function Sidebar({ isOpen, onClose, children, title }: SidebarProps) {
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const isDark = resolvedTheme === 'dark'

	useEffect(() => {
		const timer = requestAnimationFrame(() => {
			setMounted(true)
		})
		return () => cancelAnimationFrame(timer)
	}, [])

	useEffect(() => {
		if (!mounted || typeof window === 'undefined') return

		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			if (document.body) {
				document.body.style.overflow = ''
			}
		}
	}, [isOpen, mounted])

	if (!mounted) return null

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex justify-end">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="absolute inset-0"
						style={{
							background: '#B5B2BC40',
							backdropFilter: 'blur(8px)',
						}}
						onClick={onClose}
					/>

					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="relative z-10 flex h-full w-full max-w-md flex-col card shadow-xl"
					>
						<div className="flex items-center justify-between p-6">
							<h2 className="text-xl font-semibold">{title}</h2>
							<button
								onClick={onClose}
								className="rounded-md p-1"
								aria-label="Fechar sidebar"
							>
								<Image
									src="/images/Close.png"
									alt="Fechar"
									width={20}
									height={20}
									style={{
										filter: isDark ? 'invert(1)' : 'none',
									}}
								/>
							</button>
						</div>
						<div className="flex-1 overflow-y-auto p-6">{children}</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	)
}

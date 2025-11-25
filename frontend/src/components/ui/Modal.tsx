'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
	title?: string
	className?: string
}

export function Modal({
	isOpen,
	onClose,
	children,
	title,
	className,
}: ModalProps) {
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
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		if (isOpen && mounted) {
			document.addEventListener('keydown', handleEscape)
		}

		return () => {
			if (mounted) {
				document.removeEventListener('keydown', handleEscape)
			}
		}
	}, [isOpen, onClose, mounted])

	if (!mounted) return null

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0"
						style={{
							background: '#B5B2BC40',
							backdropFilter: 'blur(8px)',
						}}
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						onClick={(e) => e.stopPropagation()}
					>
						<Card
							className={cn(
								'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden',
								className,
							)}
						>
							{title && (
								<div className="flex items-center justify-between border-b border-[--color-border] py-4 mx-6">
									<h2 className="text-xl font-semibold">{title}</h2>
									<button
										onClick={onClose}
										className="rounded-md p-1 hover:scale-120 transition-all duration-300 cursor-pointer"
										aria-label="Fechar modal"
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
							)}

							{!title && (
								<button
									onClick={onClose}
									className="absolute right-4 top-4 z-10 rounded-md p-1 transition-colors hover:bg-[--color-muted]"
									aria-label="Fechar modal"
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
							)}

							<div className="flex-1 overflow-y-auto">{children}</div>
						</Card>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	)
}

'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title?: string
	description?: ReactNode
	cancelText?: string
	confirmText?: string
	isConfirmLoading?: boolean
	confirmClassName?: string
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title = 'Confirmar ação',
	description,
	cancelText = 'Cancelar',
	confirmText = 'Confirmar',
	isConfirmLoading = false,
	confirmClassName,
}: ConfirmDialogProps) {
	const [mounted, setMounted] = useState(false)

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
				<div className="fixed inset-0 z-50 flex items-center justify-center">
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
						onClick={onClose}
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.98, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.98, y: 8 }}
						transition={{ type: 'spring', damping: 24, stiffness: 240 }}
						className="relative z-10 w-[92%] max-w-md card border border-[--color-border] shadow-xl"
						role="dialog"
						aria-modal="true"
						aria-labelledby="confirm-dialog-title"
					>
						<div className="p-6">
							{title && (
								<h2 id="confirm-dialog-title" className="text-lg font-semibold">
									{title}
								</h2>
							)}
							{description && (
								<div className="mt-2 text-sm text-[--color-muted-foreground]">
									{description}
								</div>
							)}
							<div className="mt-6 flex items-center justify-end gap-3">
								<Button
									variant="secondary"
									onClick={onClose}
									disabled={isConfirmLoading}
								>
									{cancelText}
								</Button>
								<Button
									onClick={onConfirm}
									disabled={isConfirmLoading}
									className={cn(
										// destructive look
										'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400',
										confirmClassName,
									)}
								>
									{isConfirmLoading ? 'Excluindo...' : confirmText}
								</Button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	)
}

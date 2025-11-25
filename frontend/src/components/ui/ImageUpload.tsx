'use client'

import { useState, useEffect, useCallback, type ChangeEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
	value?: File | null
	onChange: (file: File | null) => void
	error?: boolean
	currentImageUrl?: string | null
}

export function ImageUpload({
	value,
	onChange,
	error,
	currentImageUrl,
}: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [dragStatus, setDragStatus] = useState<'idle' | 'accept' | 'reject'>(
		'idle',
	)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	// Gera preview quando o arquivo muda
	useEffect(() => {
		if (value instanceof File) {
			const url = URL.createObjectURL(value)
			setPreviewUrl(url)
			return () => {
				URL.revokeObjectURL(url)
			}
		} else {
			setPreviewUrl(null)
		}
	}, [value])

	// Determina qual imagem mostrar: novo arquivo ou imagem atual
	const displayUrl = previewUrl || currentImageUrl || null

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)

		// Verifica se é uma imagem
		const hasImage = Array.from(e.dataTransfer.items).some(
			(item) => item.kind === 'file' && item.type.startsWith('image/'),
		)

		setDragStatus(hasImage ? 'accept' : 'reject')
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
		setDragStatus('idle')
	}, [])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(false)
			setDragStatus('idle')

			const file = e.dataTransfer.files?.[0]
			if (file && file.type.startsWith('image/')) {
				onChange(file)
			}
		},
		[onChange],
	)

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			onChange(file)
		}
	}

	return (
		<div className="w-full">
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
					'min-h-[200px]',
					// Estilos base
					!isDragging &&
						!error &&
						'border-[--color-border] bg-transparent hover:bg-[--color-muted]',
					// Erro
					error && !isDragging && 'border-red-500 bg-red-500/5',
					// Drag aceito (Roxo)
					isDragging &&
						dragStatus === 'accept' &&
						'border-purple-500 bg-purple-500/10',
					// Drag rejeitado (Vermelho)
					isDragging &&
						dragStatus === 'reject' &&
						'border-red-500 bg-red-500/10',
				)}
			>
				<input
					type="file"
					accept="image/*"
					onChange={handleFileInput}
					className="absolute inset-0 z-20 cursor-pointer opacity-0"
				/>

				{displayUrl ? (
					<div className="relative h-full w-full">
						<div className="relative aspect-2/3 w-32 mx-auto overflow-hidden rounded-md shadow-md">
							<Image
								src={displayUrl}
								alt="Preview"
								fill
								className="object-cover"
								unoptimized={true}
							/>
						</div>
						<p className="mt-2 text-center text-xs text-[--color-muted-foreground]">
							{previewUrl ? 'Clique ou arraste para trocar' : 'Clique ou arraste para substituir'}
						</p>
					</div>
				) : (
					<div className="text-center space-y-2">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[--color-muted]">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-[--color-muted-foreground]"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" x2="12" y1="3" y2="15" />
							</svg>
						</div>
						<div className="text-sm">
							<span className="font-semibold text-[--color-primary]">
								Clique para enviar
							</span>{' '}
							ou arraste e solte
						</div>
						<p className="text-xs text-[--color-muted-foreground]">
							SVG, PNG, JPG ou GIF (max. 5MB)
						</p>
					</div>
				)}
			</div>
		</div>
	)
}


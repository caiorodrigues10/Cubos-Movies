'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Movie } from '@/services/movies/types'
import { getYouTubeEmbedUrl } from '@/lib/utils'
import { getProxiedImageUrl } from '@/lib/imageProxy'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sidebar } from '@/components/ui/Sidebar'
import { CircularRating } from '@/components/ui/CircularRating'
import { EditMovieForm } from '../EditMovieForm/EditMovieForm'
import { InfoItem } from './InfoItem'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteMovie } from '@/services/movies'
import { showToast } from '@/lib/toast'

export function MovieDetailsClient({ movie }: { movie: Movie }) {
	const router = useRouter()
	const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const proxiedPosterUrl = getProxiedImageUrl(movie.posterUrl)
	const proxiedBackdropUrl = getProxiedImageUrl(movie.backdropUrl)
	const profit =
		movie.revenue && movie.budget ? movie.revenue - movie.budget : null

	const handleDelete = async () => {
		try {
			setIsDeleting(true)
			await deleteMovie(movie.id)
			showToast({
				message: 'Filme deletado com sucesso!',
				type: 'success',
			})
			router.push('/movies')
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Erro ao deletar filme.'
			showToast({ message, type: 'error' })
		} finally {
			setIsDeleting(false)
			setIsDeleteDialogOpen(false)
		}
	}

	const formatMoney = (value: number | null | undefined) => {
		if (!value) return '—'
		if (value >= 1000000) {
			const millions = value / 1000000
			return `$${millions.toLocaleString('pt-BR', {
				maximumFractionDigits: 2,
			})}M`
		}
		return `$${value.toLocaleString('pt-BR')}`
	}

	return (
		<div className="animate-in fade-in duration-500 pb-20 relative">
			<Card
				className="w-full p-8 relative overflow-hidden"
				style={
					proxiedBackdropUrl
						? {
								backgroundImage: `url(${proxiedBackdropUrl})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
						  }
						: undefined
				}
			>
				{proxiedBackdropUrl && (
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							background: 'var(--details-gradient)',
						}}
					/>
				)}
				<div className="relative z-10">
					<div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
						<div>
							<h1 className="text-4xl font-bold text-[--color-foreground] dark:text-white mb-1 tracking-tight">
								{movie.title}
							</h1>
							{movie.originalTitle && (
								<p className="text-[--color-muted-foreground] text-sm dark:text-white">
									Título original: {movie.originalTitle}
								</p>
							)}
						</div>
						<div className="flex gap-4">
							<Button
								variant="secondary"
								onClick={() => setIsDeleteDialogOpen(true)}
								disabled={isDeleting}
							>
								{isDeleting ? 'Deletando...' : 'Deletar'}
							</Button>
							<Button
								onClick={() => setIsEditSidebarOpen(true)}
								className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-[--color-primary-foreground] border-none"
							>
								Editar
							</Button>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row gap-8 max-sm:justify-center">
						{/* Poster */}
						<div className="shrink-0 flex justify-center">
							{proxiedPosterUrl ? (
								<Image
									src={proxiedPosterUrl}
									alt={movie.title}
									width={374}
									height={542}
									className="rounded-[4px] object-cover"
									unoptimized={proxiedPosterUrl.includes('/storage/proxy')}
								/>
							) : (
								<div className="w-[374px] h-[542px] rounded-[4px] bg-[--color-muted] flex items-center justify-center text-[--color-muted-foreground]">
									Sem imagem
								</div>
							)}
						</div>

						{/* Info Content */}
						<div className="flex flex-col lg:flex-row gap-8 w-full">
							{/* Sinopse & Generos */}
							<div className="space-y-8">
								{/* Tagline */}
								{movie.tagline && (
									<p className="text-[--color-muted-foreground] italic text-lg font-light">
										{movie.tagline}
									</p>
								)}

								<InfoItem
									label="Sinopse"
									value={movie.overview || 'Sem sinopse disponível.'}
									className="h-fit! justify-start!"
								/>

								{movie.genres && movie.genres.length > 0 && (
									<div>
										<InfoItem
											label="Generos"
											value={
												<div className="flex flex-wrap gap-2">
													{movie.genres.map((g) => (
														<span
															key={g}
															className="dark:bg-[#C150FF2E] dark:text-[#ECD9FA] text-[#C150FF] bg-[#C150FF2E] p-2 rounded-[4px] text-[11px] font-bold uppercase tracking-wider"
															style={{ backdropFilter: 'blur(4px)' }}
														>
															{g}
														</span>
													))}
												</div>
											}
										/>
									</div>
								)}
							</div>

							{/* Grid de Status */}
							<div className="flex flex-col gap-4 w-full">
								<div className="flex flex-row gap-4 items-center max-sm:flex-col">
									<InfoItem label="Classificação Indicativa" value="13 anos" />

									<InfoItem
										label="VOTOS"
										value={movie.voteCount != null ? movie.voteCount : '—'}
									/>

									<div className="w-full flex items-center justify-center">
										<div className="relative flex items-center justify-center scale-130">
											<div
												className="flex items-center justify-center rounded-full"
												style={{
													background: '#00000080',
													backdropFilter: 'blur(4px)',
												}}
											>
												<CircularRating
													rating={movie.voteAverage ?? 0}
													size={70}
													strokeWidth={4}
													color="#FFE000"
													trackColor="transparent"
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="flex flex-row gap-4 max-sm:flex-col">
									<InfoItem
										label="Lançamento"
										value={
											movie.releaseDate
												? new Date(movie.releaseDate).toLocaleDateString(
														'pt-BR',
														{ timeZone: 'UTC' },
												  )
												: '—'
										}
									/>
									<InfoItem
										label="Duração"
										value={
											movie.runtime
												? `${Math.floor(movie.runtime / 60)}h ${
														movie.runtime % 60
												  }m`
												: '—'
										}
									/>
								</div>

								<div className="flex flex-row gap-4 max-sm:flex-col">
									<InfoItem label="Situação" value="Lançado" />
									<InfoItem label="Idioma" value="Inglês" />
								</div>

								<div className="flex flex-row gap-4 max-sm:flex-col">
									<InfoItem
										label="Orçamento"
										value={formatMoney(movie.budget)}
									/>
									<InfoItem
										label="Receita"
										value={formatMoney(movie.revenue)}
									/>
									<InfoItem label="Lucro" value={formatMoney(profit)} />
								</div>
							</div>
						</div>
					</div>
					{/* extra closures to balance containers */}
				</div>
			</Card>
			{/* Trailer */}
			<div className="mt-16 relative z-20">
				<h2 className="text-2xl font-bold text- dark:text-white mb-6">
					Trailer
				</h2>
				{(() => {
					const embed = getYouTubeEmbedUrl(movie.trailer ?? undefined)
					if (!embed) {
						return (
							<div className="w-full aspect-video bg-[--color-muted] rounded-lg flex items-center justify-center text-[--color-muted-foreground]">
								Sem trailer disponível
							</div>
						)
					}
					return (
						<div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-[--color-background] border border-[--color-border]">
							<iframe
								title="YouTube trailer"
								src={embed}
								className="absolute left-0 top-0 h-full w-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
							/>
						</div>
					)
				})()}
			</div>

			<Sidebar
				isOpen={isEditSidebarOpen}
				onClose={() => setIsEditSidebarOpen(false)}
				title="Editar Filme"
			>
				<EditMovieForm
					movie={movie}
					onCancel={() => setIsEditSidebarOpen(false)}
					onSuccess={() => {
						setIsEditSidebarOpen(false)
						// Revalidar a rota após fechar o sidebar
						setTimeout(() => {
							router.refresh()
						}, 300) // Aguardar a animação de fechamento do sidebar
					}}
				/>
			</Sidebar>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => {
					if (!isDeleting) setIsDeleteDialogOpen(false)
				}}
				onConfirm={handleDelete}
				title="Deletar filme"
				description="Esta ação não pode ser desfeita. Deseja remover o filme?"
				cancelText="Cancelar"
				confirmText="Deletar"
				isConfirmLoading={isDeleting}
			/>
		</div>
	)
}

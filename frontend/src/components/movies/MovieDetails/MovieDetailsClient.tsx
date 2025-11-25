'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
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

export function MovieDetailsClient({ movie }: { movie: Movie }) {
	const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false)
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const proxiedPosterUrl = getProxiedImageUrl(movie.posterUrl)
	const proxiedBackdropUrl = getProxiedImageUrl(movie.backdropUrl)
	const profit =
		movie.revenue && movie.budget ? movie.revenue - movie.budget : null

	useEffect(() => {
		const timer = requestAnimationFrame(() => {
			setMounted(true)
		})
		return () => cancelAnimationFrame(timer)
	}, [])

	const isDark = mounted && resolvedTheme === 'dark'
	const gradientStyle = isDark
		? 'linear-gradient(90deg, #121113 0%, rgba(18, 17, 19, 0.8) 50%, rgba(18, 17, 19, 0) 100%)'
		: 'linear-gradient(90deg, #faf9fb 0%, rgba(250, 249, 251, 0.8) 50%, rgba(250, 249, 251, 0) 100%)'

	const formatMoney = (value: number | null | undefined) => {
		if (!value) return '—'
		if (value >= 1000000) {
			const millions = value / 1000000
			return `$${millions.toLocaleString('en-US', { maximumFractionDigits: 2 })}M`
		}
		return `$${value.toLocaleString('en-US')}`
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
				{proxiedBackdropUrl && mounted && (
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							background: gradientStyle,
						}}
					/>
				)}
				<div className="relative z-10">
					<div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
						<div>
							<h1 className="text-4xl font-bold text-[--color-foreground] mb-1 tracking-tight">
								{movie.title}
							</h1>
							{movie.originalTitle && (
								<p className="text-[--color-muted-foreground] text-sm">
									Título original: {movie.originalTitle}
								</p>
							)}
						</div>
						<div className="flex gap-4">
							<Button variant="secondary">Deletar</Button>
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
									className="rounded-[4px] object-cover shadow-2xl"
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
												? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
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
				<h2 className="text-2xl font-bold text-[--color-foreground] mb-6">
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
						window.location.reload()
					}}
				/>
			</Sidebar>
		</div>
	)
}

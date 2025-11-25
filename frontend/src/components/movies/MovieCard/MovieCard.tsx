'use client'

import type { Movie } from '@/services/movies/types'
import Link from 'next/link'
import { getProxiedImageUrl } from '@/lib/imageProxy'
import { motion } from 'framer-motion'
import { CircularRating } from '@/components/ui/CircularRating'
import { capitalizeGenre } from '@/lib/utils'

const MotionLink = motion.create(Link)

export function MovieCard({ movie }: { movie: Movie }) {
	const proxiedPosterUrl = getProxiedImageUrl(movie.posterUrl)
	const genres =
		movie.genres?.map((g) => capitalizeGenre(g)).join(', ') || 'Sem gênero'

	return (
		<MotionLink
			href={`/movies/${movie.id}`}
			className="group relative block aspect-2/3 w-full overflow-hidden rounded-lg bg-[--color-card]"
			title={movie.title}
			initial="rest"
			whileHover="hover"
			animate="rest"
		>
			{proxiedPosterUrl ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={proxiedPosterUrl}
					alt={movie.title}
					className="h-full w-full object-cover"
					loading="lazy"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-[--color-muted] text-sm text-[--color-muted-foreground]">
					sem imagem
				</div>
			)}

			{/* Gradient Overlay */}
			<div
				className="absolute inset-0"
				style={{
					background:
						'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 50%, #000000 100%)',
				}}
				aria-hidden="true"
			/>

			{/* Rating Circle (Centered) */}
			{movie.voteAverage != null && (
				<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<div
						className="flex items-center justify-center rounded-full"
						style={{
							background: '#00000080',
							backdropFilter: 'blur(4px)',
						}}
					>
						<CircularRating
							rating={movie.voteAverage}
							size={140}
							strokeWidth={8}
						/>
					</div>
				</div>
			)}

			{/* Content */}
			<motion.div
				className="absolute bottom-0 left-0 w-full p-4 text-white"
				variants={{
					rest: { y: 0 },
					hover: { y: -8 },
				}}
				transition={{ duration: 0.3, ease: 'easeInOut' }}
			>
				<h3
					className="line-clamp-2 text-lg font-bold leading-tight"
					style={{ textShadow: '0px 1px 5px #00000033' }}
				>
					{movie.title}
				</h3>

				<motion.div
					variants={{
						rest: { height: 0, opacity: 0, marginTop: 0 },
						hover: { height: 'auto', opacity: 1, marginTop: 8 },
					}}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className="overflow-hidden"
				>
					<p
						className="line-clamp-2 text-xs font-medium text-[--color-muted-foreground]"
					>
						{genres}
					</p>
				</motion.div>
			</motion.div>
		</MotionLink>
	)
}

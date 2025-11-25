'use client'

import type { Movie } from '@/services/movies/types'
import { MovieCard } from '../MovieCard/MovieCard'
import { Pagination } from '../Pagination/Pagination'

export function MoviesListClient({
	items,
	page,
	perPage,
	total,
	basePath,
}: {
	items: Movie[]
	page: number
	perPage: number
	total: number
	basePath: string
}) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
				{items.length === 0 ? (
					<div className="col-span-full card p-6 text-center text-sm text-[--color-muted-foreground]">
						Nenhum filme encontrado
					</div>
				) : (
					items.map((movie) => <MovieCard key={movie.id} movie={movie} />)
				)}
			</div>

			<Pagination
				page={page}
				total={total}
				perPage={perPage}
				basePath={basePath}
			/>
		</div>
	)
}

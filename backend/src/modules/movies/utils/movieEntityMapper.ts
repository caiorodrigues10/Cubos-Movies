import type { MovieEntity } from '../dtos/movieDto.js'

type MovieFromDb = {
	id: string
	title: string
	originalTitle: string | null
	tagline?: string | null
	overview: string | null
	releaseDate: Date | null
	runtime: number | null
	genres: string[]
	posterUrl: string | null
	backdropUrl: string | null
	trailer?: string | null
	voteAverage?: number | null
	voteCount?: number | null
	budget?: number | null
	revenue?: number | null
	reminderSent: boolean
	ownerId: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export function mapMovieToEntity(movie: MovieFromDb): MovieEntity {
	return {
		id: movie.id,
		title: movie.title,
		originalTitle: movie.originalTitle,
		tagline: movie.tagline ?? null,
		overview: movie.overview,
		releaseDate: movie.releaseDate?.toISOString() ?? null,
		runtime: movie.runtime,
		genres: movie.genres,
		posterUrl: movie.posterUrl,
		backdropUrl: movie.backdropUrl,
		trailer: movie.trailer ?? null,
		voteAverage: movie.voteAverage ?? null,
		voteCount: movie.voteCount ?? null,
		budget: movie.budget ?? null,
		revenue: movie.revenue ?? null,
		reminderSent: movie.reminderSent,
		ownerId: movie.ownerId,
		createdAt: movie.createdAt.toISOString(),
		updatedAt: movie.updatedAt.toISOString(),
		deletedAt: movie.deletedAt?.toISOString() ?? null,
	}
}

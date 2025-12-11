import type { MovieEntity } from '../dtos/movieDto.js'
import type { Movie } from '@prisma/client'

export function mapMovieToEntity(movie: Movie): MovieEntity {
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

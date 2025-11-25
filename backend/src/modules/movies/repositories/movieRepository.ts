import { prisma } from '../../../lib/prisma.js'
import type { Movie, Prisma } from '@prisma/client'

export interface MovieFilterParams {
	search?: string
	durationMin?: number
	durationMax?: number
	releasedStart?: Date
	releasedEnd?: Date
	genres?: string[]
	voteMin?: number
}

export interface ListMoviesParams {
	ownerId: string
	page: number
	perPage: number
	filters?: MovieFilterParams
}

export interface IMovieRepository {
	findById(id: string, ownerId: string): Promise<Movie | null>
	findByTitle(
		title: string,
		ownerId: string,
		excludeId?: string,
	): Promise<Movie | null>
	create(data: Prisma.MovieUncheckedCreateInput): Promise<Movie>
	update(id: string, data: Prisma.MovieUncheckedUpdateInput): Promise<Movie>
	delete(id: string): Promise<void>
	list(params: ListMoviesParams): Promise<{ items: Movie[]; total: number }>
}

export class MovieRepository implements IMovieRepository {
	async findById(id: string, ownerId: string): Promise<Movie | null> {
		return prisma.movie.findFirst({
			where: { id, ownerId, deletedAt: null },
		})
	}

	async findByTitle(
		title: string,
		ownerId: string,
		excludeId?: string,
	): Promise<Movie | null> {
		return prisma.movie.findFirst({
			where: {
				title: { equals: title, mode: 'insensitive' },
				ownerId,
				deletedAt: null,
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		})
	}

	async create(data: Prisma.MovieUncheckedCreateInput): Promise<Movie> {
		return prisma.movie.create({ data })
	}

	async update(
		id: string,
		data: Prisma.MovieUncheckedUpdateInput,
	): Promise<Movie> {
		return prisma.movie.update({
			where: { id },
			data,
		})
	}

	async delete(id: string): Promise<void> {
		await prisma.movie.update({
			where: { id },
			data: { deletedAt: new Date() },
		})
	}

	async list(
		params: ListMoviesParams,
	): Promise<{ items: Movie[]; total: number }> {
		const { ownerId, page, perPage, filters } = params
		const where: Prisma.MovieWhereInput = { ownerId, deletedAt: null }

		if (filters) {
			const {
				search,
				durationMin,
				durationMax,
				releasedStart,
				releasedEnd,
				genres,
				voteMin,
			} = filters

			if (search) {
				where.OR = [
					{ title: { contains: search, mode: 'insensitive' } },
					{ originalTitle: { contains: search, mode: 'insensitive' } },
				]
			}

			if (durationMin !== undefined || durationMax !== undefined) {
				where.runtime = {
					...(durationMin !== undefined ? { gte: durationMin } : {}),
					...(durationMax !== undefined ? { lte: durationMax } : {}),
				}
			}

			if (releasedStart || releasedEnd) {
				where.releaseDate = {
					...(releasedStart ? { gte: releasedStart } : {}),
					...(releasedEnd ? { lte: releasedEnd } : {}),
				}
			}

			if (genres && genres.length > 0) {
				where.genres = { hasSome: genres }
			}

			if (voteMin !== undefined) {
				where.voteAverage = { gte: voteMin }
			}
		}

		const skip = (page - 1) * perPage

		const [total, items] = await Promise.all([
			prisma.movie.count({ where }),
			prisma.movie.findMany({
				where,
				skip,
				take: perPage,
				orderBy: { createdAt: 'desc' },
			}),
		])

		return { items, total }
	}
}

import type { Prisma } from '@prisma/client'
import { AppError } from '../../../lib/httpResponse.js'
import type { IMovieRepository } from '../repositories/movieRepository.js'
import type { MovieBody, MovieEntity } from '../dtos/movieDto.js'
import { mapMoviePayload } from '../utils/movieMapper.js'
import { mapMovieToEntity } from '../utils/movieEntityMapper.js'

export class CreateMovieUseCase {
	constructor(private movieRepository: IMovieRepository) {}

	async execute(data: MovieBody, ownerId: string): Promise<MovieEntity> {
		const existingMovie = await this.movieRepository.findByTitle(
			data.title,
			ownerId,
		)

		if (existingMovie) {
			throw new AppError('Já existe um filme com este título.', 409)
		}

		const mappedData = mapMoviePayload(data)

		const movie = await this.movieRepository.create({
			title: data.title,
			ownerId,
			...mappedData,
		} as Prisma.MovieUncheckedCreateInput)

		return mapMovieToEntity(movie)
	}
}

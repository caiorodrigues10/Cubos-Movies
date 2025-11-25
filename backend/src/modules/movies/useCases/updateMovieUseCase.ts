import type { Prisma } from '@prisma/client'
import { AppError } from '../../../lib/httpResponse.js'
import type { IMovieRepository } from '../repositories/movieRepository.js'
import type { UpdateMovieBody, MovieEntity } from '../dtos/movieDto.js'
import { mapMoviePayload } from '../utils/movieMapper.js'
import { mapMovieToEntity } from '../utils/movieEntityMapper.js'

export class UpdateMovieUseCase {
	constructor(private movieRepository: IMovieRepository) {}

	async execute(
		id: string,
		data: UpdateMovieBody,
		ownerId: string,
	): Promise<MovieEntity> {
		const existing = await this.movieRepository.findById(id, ownerId)

		if (!existing) {
			throw new AppError('Filme não encontrado.', 404)
		}

		// Se o título está sendo atualizado, verifica se não existe outro filme com o mesmo título
		if (data.title && data.title !== existing.title) {
			const movieWithSameTitle = await this.movieRepository.findByTitle(
				data.title,
				ownerId,
				id, // Exclui o filme atual da busca
			)

			if (movieWithSameTitle) {
				throw new AppError('Já existe um filme com este título.', 409)
			}
		}

		const mappedData = mapMoviePayload(data, existing)

		const movie = await this.movieRepository.update(
			id,
			mappedData as Prisma.MovieUncheckedUpdateInput,
		)

		return mapMovieToEntity(movie)
	}
}

import type { IGenreRepository } from '../repositories/genreRepository.js'

export class ListGenresUseCase {
	constructor(private genreRepository: IGenreRepository) {}

	async execute(ownerId: string): Promise<string[]> {
		const genres = await this.genreRepository.listDistinctByOwner(ownerId)
		return genres
	}
}

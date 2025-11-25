import { AppError } from "../../../lib/httpResponse.js";
import type { IMovieRepository } from "../repositories/movieRepository.js";

export class DeleteMovieUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(id: string, ownerId: string): Promise<void> {
    const existing = await this.movieRepository.findById(id, ownerId);

    if (!existing) {
      throw new AppError("Filme não encontrado.", 404);
    }

    await this.movieRepository.delete(id);
  }
}


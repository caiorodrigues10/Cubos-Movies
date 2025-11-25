import { AppError } from "../../../lib/httpResponse.js";
import type { IMovieRepository } from "../repositories/movieRepository.js";
import type { MovieEntity } from "../dtos/movieDto.js";
import { mapMovieToEntity } from "../utils/movieEntityMapper.js";

export class GetMovieUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(id: string, ownerId: string): Promise<MovieEntity> {
    const movie = await this.movieRepository.findById(id, ownerId);

    if (!movie) {
      throw new AppError("Filme não encontrado.", 404);
    }

    return mapMovieToEntity(movie);
  }
}


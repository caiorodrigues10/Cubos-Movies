import type { IMovieRepository, ListMoviesParams } from "../repositories/movieRepository.js";
import type { MovieListResponse } from "../dtos/movieDto.js";
import { parseFilters } from "../utils/filterParser.js";
import { mapMovieToEntity } from "../utils/movieEntityMapper.js";

export class ListMoviesUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(params: {
    ownerId: string;
    page?: number;
    perPage?: number;
    search?: string;
    filters?: string;
  }): Promise<MovieListResponse> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 10;

    let parsedFilters = parseFilters(params.filters);
    if (params.search && !parsedFilters?.search) {
      parsedFilters = parsedFilters ?? {};
      parsedFilters.search = params.search;
    }

    const { items, total } = await this.movieRepository.list({
      ownerId: params.ownerId,
      page,
      perPage,
      filters: parsedFilters,
    });

    return {
      items: items.map(mapMovieToEntity),
      page,
      perPage,
      total,
    };
  }
}


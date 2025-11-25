import type { MovieFilterParams } from "../repositories/movieRepository.js";
import { transformNumber, transformFilterDate } from "./movieMapper.js";

export function parseFilters(filtersString?: string): MovieFilterParams | undefined {
  if (!filtersString) return undefined;

  const filterParams = new URLSearchParams(filtersString);
  const filters: MovieFilterParams = {};

  const search = filterParams.get("search");
  if (search) filters.search = search;

  const durationMin = transformNumber(filterParams.get("durationMin"));
  const durationMax = transformNumber(filterParams.get("durationMax"));
  if (durationMin !== undefined) filters.durationMin = durationMin;
  if (durationMax !== undefined) filters.durationMax = durationMax;

  const releasedStart = transformFilterDate(filterParams.get("releasedStart"), "start");
  const releasedEnd = transformFilterDate(filterParams.get("releasedEnd"), "end");
  if (releasedStart) filters.releasedStart = releasedStart;
  if (releasedEnd) filters.releasedEnd = releasedEnd;

  const genresRaw = filterParams.get("genres");
  if (genresRaw) {
    const genres = genresRaw
      .split(",")
      .map((genre) => genre.trim().toLowerCase())
      .filter(Boolean);
    if (genres.length > 0) filters.genres = genres;
  }

  const voteMinRaw = transformNumber(filterParams.get("voteMin"));
  if (voteMinRaw !== undefined) {
    filters.voteMin = voteMinRaw > 10 ? voteMinRaw / 10 : voteMinRaw;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

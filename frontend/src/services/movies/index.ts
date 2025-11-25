import type { CreateMovieRequest, Movie } from './types'
import { apiRequest, HttpMethod } from '../Api'

export async function createMovie(payload: CreateMovieRequest): Promise<Movie> {
	return apiRequest<Movie>(`/movies`, {
		method: HttpMethod.POST,
		body: JSON.stringify(payload),
	})
}

export async function getMovieById(id: string): Promise<Movie> {
	return apiRequest<Movie>(`/movies/${id}`)
}

export type UpdateMovieRequest = Partial<CreateMovieRequest>

export async function updateMovie(
	id: string,
	payload: UpdateMovieRequest,
): Promise<Movie> {
	return apiRequest<Movie>(`/movies/${id}`, {
		method: HttpMethod.PUT,
		body: JSON.stringify(payload),
	})
}

export async function deleteMovie(id: string): Promise<void> {
	return apiRequest<void>(`/movies/${id}`, {
		method: HttpMethod.DELETE,
	})
}

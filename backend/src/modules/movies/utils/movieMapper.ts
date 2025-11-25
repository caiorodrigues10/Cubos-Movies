import dayjs from 'dayjs'
import type { MovieBody, UpdateMovieBody } from '../dtos/movieDto.js'
import type { Movie } from '@prisma/client'

export function mapMoviePayload(
	payload: Partial<MovieBody>,
	previous?: { releaseDate: Date | null },
) {
	const data: Record<string, unknown> = {}

	if (payload.title !== undefined) data.title = payload.title
	if (payload.originalTitle !== undefined)
		data.originalTitle = payload.originalTitle || null
	if (payload.tagline !== undefined) data.tagline = payload.tagline || null
	if (payload.overview !== undefined) data.overview = payload.overview || null
	if (payload.runtime !== undefined) data.runtime = payload.runtime
	if (payload.genres !== undefined) {
		data.genres = payload.genres
			.map((genre) => genre.trim().toLowerCase())
			.filter(Boolean)
	}
	if (payload.posterUrl !== undefined)
		data.posterUrl = payload.posterUrl || null
	if (payload.backdropUrl !== undefined)
		data.backdropUrl = payload.backdropUrl || null
	if (payload.trailer !== undefined) data.trailer = payload.trailer || null
	if (payload.voteAverage !== undefined) data.voteAverage = payload.voteAverage
	if (payload.voteCount !== undefined) data.voteCount = payload.voteCount
	if (payload.budget !== undefined) data.budget = payload.budget
	if (payload.revenue !== undefined) data.revenue = payload.revenue

	if (payload.releaseDate !== undefined) {
		const parsed = transformDate(payload.releaseDate)
		data.releaseDate = parsed ?? null
		if (parsed && dayjs(parsed).isAfter(dayjs())) {
			data.reminderSent = false
		} else if (!parsed && previous?.releaseDate) {
			data.reminderSent = true
		}
	}

	return data
}

export function transformNumber(value?: string | null) {
	if (!value) return undefined
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

export function transformDate(value?: string | null) {
	if (!value) return undefined
	const parsed = dayjs(value)
	if (!parsed.isValid()) return undefined
	return parsed.toDate()
}

export function transformFilterDate(
	value: string | null | undefined,
	boundary: 'start' | 'end',
) {
	if (!value) return undefined
	const parsed = dayjs(value)
	if (!parsed.isValid()) return undefined
	return (
		boundary === 'start' ? parsed.startOf('day') : parsed.endOf('day')
	).toDate()
}

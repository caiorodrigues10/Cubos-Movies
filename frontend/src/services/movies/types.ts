export type CreateMovieRequest = {
	title: string
	originalTitle?: string
	tagline?: string
	overview?: string
	releaseDate?: string // ISO date (YYYY-MM-DD)
	runtime?: number
	genres?: string[]
	posterUrl?: string
	backdropUrl?: string
	trailer?: string
	voteCount?: number
	budget?: number
	revenue?: number
}

export type Movie = {
	id: string
	title: string
	originalTitle?: string | null
	tagline?: string | null
	overview?: string | null
	releaseDate?: string | null
	runtime?: number | null
	genres?: string[] | null
	posterUrl?: string | null
	backdropUrl?: string | null
	trailer?: string | null
	voteAverage?: number | null
	voteCount?: number | null
	budget?: number | null
	revenue?: number | null
	ownerId?: string | null
	createdAt?: string
	updatedAt?: string
	deletedAt?: string | null
}

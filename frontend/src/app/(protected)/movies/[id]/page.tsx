import { MovieDetailsClient } from '@/components/movies/MovieDetails/MovieDetailsClient'
import { serverFetch } from '@/lib/api'
import { Movie } from '@/services/movies/types'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

interface MovieDetailsPageProps {
	params: Promise<{ id: string }> | { id: string }
}

export async function generateMetadata({
	params,
}: MovieDetailsPageProps): Promise<Metadata> {
	// Resolve params if it's a Promise (Next.js 15+)
	const resolvedParams = params instanceof Promise ? await params : params

	try {
		const movie = await serverFetch<Movie>(`/movies/${resolvedParams.id}`)
		if (movie?.title) {
			return {
				title: `Informações sobre o filme - ${movie.title} | Cubos Movies`,
			}
		}
	} catch {}
	return { title: 'Informações sobre o filme - Cubos Movies' }
}

export default async function MovieDetailsPage({
	params,
}: MovieDetailsPageProps) {
	// Resolve params if it's a Promise (Next.js 15+)
	const resolvedParams = params instanceof Promise ? await params : params

	let movie = null
	try {
		movie = await serverFetch<Movie>(`/movies/${resolvedParams.id}`)
	} catch {
		redirect('/movies')
	}

	if (!movie) {
		redirect('/movies')
	}

	return <MovieDetailsClient movie={movie} />
}

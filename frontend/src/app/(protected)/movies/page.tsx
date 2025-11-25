import { buildBackendFiltersFromQuery } from '@/lib/filters'
import { MoviesListClient } from '@/components/movies/MoviesList/MoviesListClient'
import { MoviesHeader } from '@/components/movies/MoviesHeader/MoviesHeader'
import { serverFetchWithQuery, type PaginatedResponse } from '@/lib/api'
import type { Movie } from '@/services/movies/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'Filmes - Cubos Movies',
}

export default async function MoviesListPage({
	searchParams,
}: {
	searchParams:
		| Promise<{ [key: string]: string | string[] | undefined }>
		| { [key: string]: string | string[] | undefined }
}) {
	// Resolve searchParams if it's a Promise (Next.js 15+)
	const resolvedSearchParams =
		searchParams instanceof Promise ? await searchParams : searchParams

	const page =
		Number(
			(Array.isArray(resolvedSearchParams.page)
				? resolvedSearchParams.page[0]
				: resolvedSearchParams.page) ?? '1',
		) || 1
	const limit = 10

	// Build backend `filters` from query params
	const urlSearchParams = new URLSearchParams()
	const searchParamsKeys = Object.keys(resolvedSearchParams) as string[]
	for (const paramKey of searchParamsKeys) {
		const paramValue = resolvedSearchParams[paramKey]
		if (paramValue === undefined) continue
		if (Array.isArray(paramValue))
			paramValue.forEach((paramValueItem) =>
				urlSearchParams.append(paramKey, paramValueItem),
			)
		else urlSearchParams.set(paramKey, paramValue)
	}
	const backendFilters = buildBackendFiltersFromQuery(urlSearchParams)

	const paginatedMovies = await serverFetchWithQuery<PaginatedResponse<Movie>>(
		'/movies',
		{
			page,
			perPage: limit,
			...(backendFilters ? { filters: backendFilters } : {}),
			...(urlSearchParams.get('name')
				? { search: urlSearchParams.get('name')! }
				: {}),
		},
	)

	const basePath = '/movies'

	return (
		<div className="space-y-6">
			<MoviesHeader />

			<MoviesListClient
				items={paginatedMovies.items}
				page={paginatedMovies.page}
				perPage={paginatedMovies.perPage}
				total={paginatedMovies.total}
				basePath={basePath}
			/>
		</div>
	)
}

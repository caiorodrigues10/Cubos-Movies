export type FilterSegment =
	| `dur-gte-${string}`
	| `dur-lte-${string}`
	| `date-${string}` // format: YYYY-MM-DD_YYYY-MM-DD
	| `genre-${string}` // comma-separated
	| `vote-gte-${string}`
	| `search-${string}`

/**
 * Converts catch-all route segments into a backend query string.
 * Example input:
 *   ["dur-gte-90", "date-2020-01-01_2021-01-01", "genre-acao,aventura", "vote-gte-70"]
 * Output query string:
 *   "durationMin=90&releasedStart=2020-01-01&releasedEnd=2021-01-01&genres=acao,aventura&voteMin=70"
 */
export function buildQueryFromFilterSegments(
	segments?: string[] | null,
): string {
	if (!segments || segments.length === 0) return ''
	const params = new URLSearchParams()

	for (const seg of segments) {
		if (seg.startsWith('dur-gte-')) {
			params.set('durationMin', seg.replace('dur-gte-', ''))
		} else if (seg.startsWith('dur-lte-')) {
			params.set('durationMax', seg.replace('dur-lte-', ''))
		} else if (seg.startsWith('date-')) {
			const payload = seg.replace('date-', '')
			const [start, end] = payload.split('_')
			if (start) params.set('releasedStart', start)
			if (end) params.set('releasedEnd', end)
		} else if (seg.startsWith('genre-')) {
			params.set('genres', seg.replace('genre-', ''))
		} else if (seg.startsWith('vote-gte-')) {
			params.set('voteMin', seg.replace('vote-gte-', ''))
		} else if (seg.startsWith('search-')) {
			params.set('search', decodeURIComponent(seg.replace('search-', '')))
		}
	}
	return params.toString()
}

/**
 * Utility to toggle a single token inside a comma-separated genres list.
 */
export function toggleCommaToken(value: string, token: string): string {
	const set = new Set(value ? value.split(',') : [])
	if (set.has(token)) set.delete(token)
	else set.add(token)
	return Array.from(set).filter(Boolean).join(',')
}

/**
 * Build backend `filters` query string from URL search params (query param style).
 * Recognized inputs (Portuguese aliases supported):
 *  - nome | q | search -> search
 *  - genero (multi) | genres -> genres (comma-separated)
 *  - durMin | durationMin -> durationMin
 *  - durMax | durationMax -> durationMax
 *  - dataInicio | releasedStart -> releasedStart (YYYY-MM-DD)
 *  - dataFim | releasedEnd -> releasedEnd (YYYY-MM-DD)
 *  - voteMin -> voteMin
 */
export function buildBackendFiltersFromQuery(search: URLSearchParams): string {
	const out = new URLSearchParams()

	const searchTerm =
		search.get('nome') ?? search.get('q') ?? search.get('search')
	if (searchTerm) out.set('search', searchTerm)

	const genres = search.getAll('genero').concat(search.getAll('genres'))
	if (genres.length > 0)
		out.set('genres', genres.map((g) => g.toLowerCase()).join(','))

	const durMin = search.get('durMin') ?? search.get('durationMin')
	if (durMin) out.set('durationMin', durMin)
	const durMax = search.get('durMax') ?? search.get('durationMax')
	if (durMax) out.set('durationMax', durMax)

	const start = search.get('dataInicio') ?? search.get('releasedStart')
	if (start) out.set('releasedStart', start)
	const end = search.get('dataFim') ?? search.get('releasedEnd')
	if (end) out.set('releasedEnd', end)

	const voteMin = search.get('voteMin')
	if (voteMin) out.set('voteMin', voteMin)

	return out.toString()
}

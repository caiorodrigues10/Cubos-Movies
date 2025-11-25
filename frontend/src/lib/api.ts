import 'server-only'
import { cookies } from 'next/headers'
import { env } from './env'
import type { AppResponse } from '@/services/AppResponse'
import type { Movie } from '@/services/movies/types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type PaginatedResponse<T> = {
	items: T[]
	page: number
	perPage: number
	total: number
}

export type MovieListParams = {
	page?: number
	perPage?: number
	query?: string
	search?: string
}

export type QueryParamsValue =
	| string
	| number
	| boolean
	| Array<string | number | boolean>
export type QueryParams = Record<string, QueryParamsValue | undefined | null>

function buildQueryString(query?: QueryParams): string {
	if (!query) return ''
	const params = new URLSearchParams()
	for (const [key, raw] of Object.entries(query)) {
		if (raw === undefined || raw === null) continue
		const value = Array.isArray(raw) ? raw : [raw]
		for (const v of value) {
			const s = typeof v === 'boolean' ? String(v) : String(v)
			if (s.trim() === '') continue
			params.append(key, s)
		}
	}
	const qs = params.toString()
	return qs ? `?${qs}` : ''
}

export async function serverFetch<T>(
	path: string,
	options: RequestInit & { method?: HttpMethod } = {},
): Promise<T> {
	const cookieStore = await cookies()
	const token = cookieStore.get(env.COOKIE_NAME)?.value

	const url = `${env.BACKEND_URL}${path}`
	const res = await fetch(url, {
		...options,
		method: options.method ?? 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		const message = await res.text().catch(() => res.statusText)
		throw new Error(`API ${res.status}: ${message}`)
	}
	const payload = (await res.json()) as AppResponse<T>

	if (payload.result === 'error') {
		throw new Error(payload.message || `API ${res.status}`)
	}

	return (payload.data ?? null) as T
}

export async function serverFetchWithQuery<T>(
	path: string,
	query?: QueryParams,
	options: RequestInit & { method?: HttpMethod } = {},
): Promise<T> {
	const qs = buildQueryString(query)
	return serverFetch<T>(`${path}${qs}`, options)
}

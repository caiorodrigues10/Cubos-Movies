import type { AppResponse } from './AppResponse'

export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}

const BASE_URL =
	typeof window !== 'undefined'
		? '/api/proxy'
		: (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3333')

export async function apiRequest<T>(
	path: string,
	options: RequestInit & { method?: HttpMethod } = {},
): Promise<T> {
	const response = await fetch(`${BASE_URL}${path}`, {
		...options,
		method: options.method ?? HttpMethod.GET,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
		},
		credentials: 'include',
	})

	if (!response.ok) {
		if (response.status === 401) {
			if (typeof window !== 'undefined') {
				window.location.href = '/api/auth/logout'
			}
		}

		const text = await response.text().catch(() => response.statusText)
		try {
			const errorData = JSON.parse(text)
			if (
				errorData &&
				typeof errorData === 'object' &&
				'message' in errorData
			) {
				throw new Error(errorData.message || response.statusText)
			}
			throw new Error(response.statusText)
		} catch (parseError) {
			if (
				parseError instanceof Error &&
				parseError.message !== response.statusText
			) {
				throw parseError
			}
			throw new Error(text || response.statusText)
		}
	}

	const payload = (await response.json()) as AppResponse<T>

	if (payload.result === 'error') {
		if (payload.statusCode === 401) {
			if (typeof window !== 'undefined') {
				window.location.href = '/api/auth/logout'
			}
		}
		throw new Error(payload.message || 'Erro ao comunicar com a API')
	}

	return (payload.data ?? null) as T
}

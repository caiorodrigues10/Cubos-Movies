import { apiRequest, HttpMethod } from './Api'

const BASE_URL =
	typeof window !== 'undefined'
		? '/api/proxy'
		: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3333'

export async function uploadImageViaPresign(file: File): Promise<string> {
	try {
		const formData = new FormData()
		formData.append('file', file)

		const response = await fetch(`${BASE_URL}/storage/upload`, {
			method: 'POST',
			body: formData,
			credentials: 'include',
		})

		if (!response.ok) {
			if (response.status === 401) {
				if (typeof window !== 'undefined') {
					window.location.href = '/api/auth/logout'
				}
				throw new Error('Não autorizado')
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

		const payload = (await response.json()) as {
			result: string
			data: { objectUrl: string }
			message: string
		}

		if (payload.result === 'error') {
			throw new Error(payload.message || 'Erro ao fazer upload da imagem')
		}

		return payload.data.objectUrl
	} catch (error) {
		if (error instanceof TypeError && error.message === 'Failed to fetch') {
			throw new Error(
				'Falha ao conectar com o servidor. Verifique sua conexão com a internet e se o servidor está rodando.',
			)
		}
		// Re-throw with more context if it's not already an Error
		if (error instanceof Error) {
			throw error
		}
		throw new Error(`Erro ao fazer upload da imagem: ${String(error)}`)
	}
}

import { apiRequest } from '@/services/Api'

export async function getGenres(): Promise<string[]> {
	return apiRequest<string[]>('/genres')
}

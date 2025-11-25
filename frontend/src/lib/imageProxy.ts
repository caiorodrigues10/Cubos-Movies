/**
 * Retorna a URL da imagem usando proxy do backend
 * Isso resolve problemas de acesso quando o bucket não está público
 *
 * Para usar URLs diretas do GCS (quando o bucket for público):
 * 1. Configure o bucket como público no Google Cloud Console
 * 2. Defina NEXT_PUBLIC_USE_GCS_PROXY=false no .env
 */
export function getProxiedImageUrl(
	url: string | null | undefined,
): string | null {
	if (!url) return null

	// Se já é uma URL do proxy, retorna como está
	if (url.includes('/storage/proxy')) return url

	// Verifica se deve usar proxy (padrão: true para segurança)
	const useProxy = process.env.NEXT_PUBLIC_USE_GCS_PROXY !== 'false'

	// Se é uma URL do Google Cloud Storage
	if (url.includes('storage.googleapis.com')) {
		if (useProxy) {
			// Usa proxy do backend
			const backendUrl =
				process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333'
			return `${backendUrl}/storage/proxy?url=${encodeURIComponent(url)}`
		}
		// Retorna URL direta (bucket público)
		return url
	}

	// Para outras URLs (ex: URLs externas), retorna como está
	return url
}

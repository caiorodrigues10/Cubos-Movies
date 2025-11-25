export function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(' ')
}

export function getYouTubeEmbedUrl(input?: string | null): string | null {
	if (!input) return null
	try {
		const url = new URL(input)
		const host = url.hostname.replace(/^www\./i, '').toLowerCase()

		let videoId: string | null = null

		if (
			host === 'youtube.com' ||
			host === 'm.youtube.com' ||
			host === 'music.youtube.com'
		) {
			if (url.pathname === '/watch') {
				videoId = url.searchParams.get('v')
			} else if (url.pathname.startsWith('/embed/')) {
				videoId = url.pathname.split('/')[2] || null
			} else if (url.pathname.startsWith('/shorts/')) {
				videoId = url.pathname.split('/')[2] || null
			}
		} else if (host === 'youtu.be') {
			videoId = url.pathname.split('/')[1] || null
		}

		if (!videoId) return null

		videoId = videoId.trim()
		if (!/^[\w-]{6,}$/.test(videoId)) return null

		return `https://www.youtube.com/embed/${videoId}`
	} catch {
		return null
	}
}

export function capitalizeGenre(genre: string): string {
	return genre
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

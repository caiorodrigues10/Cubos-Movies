import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { Storage } from '@google-cloud/storage'
import { GoogleAuth } from 'google-auth-library'

dotenv.config()

const prisma = new PrismaClient()

type SeedMovie = {
	title: string
	originalTitle?: string
	overview?: string
	releaseDate?: string // ISO
	runtime?: number
	genres: string[]
	posterSourceUrl: string
	backdropSourceUrl?: string
	trailer: string // YouTube URL
	voteAverage?: number
	budget?: number
	revenue?: number
}

function assertEnv(name: string, value: string | undefined): string {
	if (!value) {
		throw new Error(`Missing env var: ${name}`)
	}
	return value
}

const GCP_BUCKET_NAME = assertEnv(
	'GCP_BUCKET_NAME',
	process.env.GCP_BUCKET_NAME,
)
const GCP_CLIENT_EMAIL = assertEnv(
	'GCP_CLIENT_EMAIL',
	process.env.GCP_CLIENT_EMAIL,
)
const RAW_PRIVATE_KEY = assertEnv(
	'GCP_PRIVATE_KEY',
	process.env.GCP_PRIVATE_KEY,
)
const GCP_PRIVATE_KEY = RAW_PRIVATE_KEY.replace(/\\n/g, '\n')
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID // optional

const storage = new Storage({
	projectId: GCP_PROJECT_ID,
	credentials: { client_email: GCP_CLIENT_EMAIL, private_key: GCP_PRIVATE_KEY },
})
const bucket = storage.bucket(GCP_BUCKET_NAME)

// Inicializa GoogleAuth para usar na API REST
const auth = new GoogleAuth({
	credentials: {
		client_email: GCP_CLIENT_EMAIL,
		private_key: GCP_PRIVATE_KEY,
	},
	scopes: ['https://www.googleapis.com/auth/devstorage.full_control'],
})

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

async function urlOk(
	url: string,
	contentTypeStartsWith?: string,
	timeoutMs = 12000,
): Promise<boolean> {
	// Alguns hosts exigem User-Agent/Accept para permitir HEAD/GET
	const defaultHeaders = {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36',
		Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
	} as Record<string, string>
	try {
		const controller = new AbortController()
		const t = setTimeout(() => controller.abort(), timeoutMs)
		// Try HEAD first
		const headResp = await fetch(url, {
			method: 'HEAD',
			redirect: 'follow',
			headers: defaultHeaders,
			signal: controller.signal,
		})
		clearTimeout(t)
		if (headResp.ok) {
			if (!contentTypeStartsWith) return true
			const ct = headResp.headers.get('content-type') || ''
			return ct.toLowerCase().startsWith(contentTypeStartsWith.toLowerCase())
		}
	} catch {
		// ignore and try GET
	}
	try {
		const controller = new AbortController()
		const t = setTimeout(() => controller.abort(), timeoutMs)
		const getResp = await fetch(url, {
			method: 'GET',
			redirect: 'follow',
			headers: defaultHeaders,
			signal: controller.signal,
		})
		clearTimeout(t)
		if (!getResp.ok) return false
		if (!contentTypeStartsWith) return true
		const ct = getResp.headers.get('content-type') || ''
		return ct.toLowerCase().startsWith(contentTypeStartsWith.toLowerCase())
	} catch {
		return false
	}
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '')
}

async function downloadBuffer(
	url: string,
	timeoutMs = 20000,
): Promise<{ buffer: Buffer; contentType: string }> {
	const controller = new AbortController()
	const t = setTimeout(() => controller.abort(), timeoutMs)
	const resp = await fetch(url, {
		method: 'GET',
		redirect: 'follow',
		signal: controller.signal,
	})
	clearTimeout(t)
	if (!resp.ok) {
		throw new Error(
			`Failed to download ${url}: ${resp.status} ${resp.statusText}`,
		)
	}
	const arrayBuffer = await resp.arrayBuffer()
	const contentType =
		resp.headers.get('content-type') || 'application/octet-stream'
	return { buffer: Buffer.from(arrayBuffer), contentType }
}

async function uploadPublicToGcs(
	key: string,
	buffer: Buffer,
	contentType: string,
): Promise<string> {
	const file = bucket.file(key)

	try {
		// Usa API REST diretamente para evitar problemas com ACLs e UBLA
		const client = await auth.getClient()
		const accessTokenResponse = await client.getAccessToken()
		const accessToken = accessTokenResponse.token

		if (!accessToken) {
			throw new Error('Não foi possível obter token de acesso')
		}

		const url = `https://storage.googleapis.com/upload/storage/v1/b/${GCP_BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(key)}`

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000',
			},
			body: buffer as any, // Buffer é compatível com fetch body
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(
				`GCS API error: ${response.status} ${response.statusText} - ${errorText}`,
			)
		}

		// Com UBLA habilitado, a visibilidade é controlada no nível do bucket via IAM
		return `https://storage.googleapis.com/${GCP_BUCKET_NAME}/${key}`
	} catch (error: any) {
		// Se houver erro de autenticação, relançar com mensagem mais clara
		if (
			error.message?.includes('invalid_grant') ||
			error.message?.includes('401')
		) {
			const errorMsg =
				`\n❌ Erro de autenticação com Google Cloud Storage\n` +
				`\nA conta de serviço precisa ter permissões no bucket.\n` +
				`Conta: ${GCP_CLIENT_EMAIL}\n` +
				`Bucket: ${GCP_BUCKET_NAME}\n` +
				`Projeto: ${GCP_PROJECT_ID}\n` +
				`\n📖 Consulte o arquivo GCS_SETUP.md para instruções detalhadas.\n` +
				`\nErro original: ${error.message}\n`
			throw new Error(errorMsg)
		}
		throw error
	}
}

async function ensureUser(): Promise<{ id: string }> {
	const email = 'cubos@cubos.com'
	const name = 'cubos'
	const plainPassword = 'Cubos123@'
	const passwordHash = await bcrypt.hash(plainPassword, 10)
	const user = await prisma.user.upsert({
		where: { email },
		update: {},
		create: { email, name, passwordHash },
		select: { id: true },
	})
	return user
}

const MOVIES: SeedMovie[] = [
	{
		title: 'The Matrix',
		originalTitle: 'The Matrix',
		overview:
			'Um hacker descobre que a realidade é uma simulação e se junta a rebeldes para libertar a humanidade.',
		releaseDate: '1999-03-31',
		runtime: 136,
		genres: ['ação', 'ficção científica'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
		trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
		voteAverage: 8.7,
	},
	{
		title: 'Inception',
		originalTitle: 'Inception',
		overview:
			'Um ladrão que invade sonhos recebe a missão de plantar uma ideia na mente de um magnata.',
		releaseDate: '2010-07-16',
		runtime: 148,
		genres: ['ação', 'ficção científica', 'suspense'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
		trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
		voteAverage: 8.8,
	},
	{
		title: 'Interstellar',
		originalTitle: 'Interstellar',
		overview:
			'Exploradores viajam através de um buraco de minhoca no espaço em busca de um novo lar para a humanidade.',
		releaseDate: '2014-11-07',
		runtime: 169,
		genres: ['ficção científica', 'drama', 'aventura'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
		trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
		voteAverage: 8.6,
	},
	{
		title: 'The Dark Knight',
		originalTitle: 'The Dark Knight',
		overview:
			'Batman enfrenta o Coringa em uma batalha que coloca Gotham em colapso.',
		releaseDate: '2008-07-18',
		runtime: 152,
		genres: ['ação', 'crime', 'drama'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg',
		trailer: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
		voteAverage: 9.0,
	},
	{
		title: 'Parasite',
		originalTitle: '기생충',
		overview:
			'Família pobre se infiltra na vida de uma família rica, gerando consequências imprevisíveis.',
		releaseDate: '2019-05-30',
		runtime: 132,
		genres: ['drama', 'suspense'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png',
		trailer: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
		voteAverage: 8.6,
	},
	{
		title: 'Spirited Away',
		originalTitle: '千と千尋の神隠し',
		overview:
			'Uma garota entra em um mundo mágico e precisa encontrar coragem para salvar seus pais.',
		releaseDate: '2001-07-20',
		runtime: 125,
		genres: ['animação', 'fantasia', 'aventura'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/3/30/Spirited_Away_poster.JPG',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/3/30/Spirited_Away_poster.JPG',
		trailer: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
		voteAverage: 8.5,
	},
	{
		title: 'The Godfather',
		originalTitle: 'The Godfather',
		overview:
			'A história da família mafiosa Corleone e a ascensão de Michael ao poder.',
		releaseDate: '1972-03-24',
		runtime: 175,
		genres: ['crime', 'drama'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
		trailer: 'https://www.youtube.com/watch?v=sY1S34973zA',
		voteAverage: 9.2,
	},
	{
		title: 'Pulp Fiction',
		originalTitle: 'Pulp Fiction',
		overview: 'Histórias entrelaçadas de crime e redenção em Los Angeles.',
		releaseDate: '1994-10-14',
		runtime: 154,
		genres: ['crime', 'drama'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/8/82/Pulp_Fiction_cover.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/8/82/Pulp_Fiction_cover.jpg',
		trailer: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
		voteAverage: 8.9,
	},
	{
		title: 'Avengers: Endgame',
		originalTitle: 'Avengers: Endgame',
		overview:
			'Os Vingadores restantes tentam reverter o estalar de dedos de Thanos.',
		releaseDate: '2019-04-26',
		runtime: 181,
		genres: ['ação', 'aventura', 'ficção científica'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
		trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
		voteAverage: 8.4,
	},
	{
		title: 'Toy Story',
		originalTitle: 'Toy Story',
		overview: 'Brinquedos ganham vida quando os humanos não estão por perto.',
		releaseDate: '1995-11-22',
		runtime: 81,
		genres: ['animação', 'comédia', 'família'],
		posterSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg',
		backdropSourceUrl:
			'https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg',
		trailer: 'https://www.youtube.com/watch?v=4KPTXpQehio',
		voteAverage: 8.3,
	},
]

async function main() {
	console.log('Starting seed...')
	console.log('📤 Upload das imagens para o GCS habilitado')
	const user = await ensureUser()
	console.log(`User ready: ${user.id}`)

	const acceptedMovies: SeedMovie[] = []
	for (const m of MOVIES) {
		const candidate: SeedMovie = { ...m }

		// Valida poster; se inválido, substitui por placeholder confiável
		let posterOk = await urlOk(candidate.posterSourceUrl, 'image/')
		if (!posterOk) {
			const placeholderPoster = `https://picsum.photos/seed/${slugify(
				candidate.title,
			)}-poster/800/1200.jpg`
			if (await urlOk(placeholderPoster, 'image/')) {
				console.warn(
					`Poster inválido substituído por placeholder: ${candidate.title}`,
				)
				candidate.posterSourceUrl = placeholderPoster
				posterOk = true
			}
		}

		// Valida backdrop; se inválido, substitui por placeholder
		let backdropOk = true
		if (candidate.backdropSourceUrl) {
			backdropOk = await urlOk(candidate.backdropSourceUrl, 'image/')
			if (!backdropOk) {
				const placeholderBackdrop = `https://picsum.photos/seed/${slugify(
					candidate.title,
				)}-backdrop/1920/1080.jpg`
				if (await urlOk(placeholderBackdrop, 'image/')) {
					console.warn(
						`Backdrop inválido substituído por placeholder: ${candidate.title}`,
					)
					candidate.backdropSourceUrl = placeholderBackdrop
					backdropOk = true
				}
			}
		}

		if (!posterOk || !backdropOk) {
			console.warn(`Skipping movie due to invalid URLs: ${candidate.title}`)
			continue
		}
		acceptedMovies.push(candidate)
		// be gentle to remote servers
		await sleep(200)
	}

	const createdMovies: string[] = []

	for (const m of acceptedMovies) {
		try {
			let posterUrl: string
			let backdropUrl: string | undefined

			// Upload para GCS
			const { buffer: posterBuffer, contentType: posterType } =
				await downloadBuffer(m.posterSourceUrl)
			const posterKey = `seed/users/${user.id}/${slugify(m.title)}-${(m.releaseDate || '').slice(0, 4) || 'na'}-poster.jpg`
			posterUrl = await uploadPublicToGcs(posterKey, posterBuffer, posterType)

			if (m.backdropSourceUrl) {
				const { buffer: backdropBuffer, contentType: backdropType } =
					await downloadBuffer(m.backdropSourceUrl)
				const backdropKey = `seed/users/${user.id}/${slugify(m.title)}-${(m.releaseDate || '').slice(0, 4) || 'na'}-backdrop.jpg`
				backdropUrl = await uploadPublicToGcs(
					backdropKey,
					backdropBuffer,
					backdropType,
				)
			}

			const created = await prisma.movie.create({
				data: {
					title: m.title,
					originalTitle: m.originalTitle,
					overview: m.overview,
					releaseDate: m.releaseDate ? new Date(m.releaseDate) : undefined,
					runtime: m.runtime,
					genres: m.genres,
					posterUrl,
					backdropUrl,
					trailer: m.trailer,
					voteAverage: m.voteAverage,
					budget: m.budget,
					revenue: m.revenue,
					ownerId: user.id,
				},
				select: { id: true, title: true },
			})
			createdMovies.push(`${created.title} (${created.id})`)
			console.log(`✅ Seeded movie: ${created.title}`)
			await sleep(150)
		} catch (err) {
			const errorMsg = (err as Error).message
			console.error(`❌ Failed to seed ${m.title}:`, errorMsg)
		}
	}

	const distinctGenres = Array.from(
		new Set(acceptedMovies.flatMap((m) => m.genres)),
	).sort()
	console.log(
		`Distinct genres seeded into movies: ${distinctGenres.join(', ')}`,
	)
	console.log(`Created ${createdMovies.length} movies`)
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

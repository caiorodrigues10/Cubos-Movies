import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]

export const createMovieSchema = z.object({
	title: z.string().min(1, 'Título é obrigatório'),
	originalTitle: z.string().optional(),
	tagline: z.string().optional(),
	overview: z.string().min(10, 'Sinopse deve ter pelo menos 10 caracteres'),
	releaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Data inválida',
	}),
	runtime: z
		.number()
		.min(1, 'Duração é obrigatória e deve ser maior que 0')
		.int('Duração deve ser um número inteiro'),
	genres: z.string().min(1, 'Adicione pelo menos um gênero'),
	budget: z.number().min(0).optional(),
	revenue: z.number().min(0).optional(),
	trailer: z
		.string()
		.url('URL do trailer inválida')
		.optional()
		.or(z.literal('')),
	poster: z
		.custom<File>((val) => val instanceof File, 'Pôster é obrigatório')
		.refine(
			(file) => file.size <= MAX_FILE_SIZE,
			`Arquivo muito grande (max 5MB)`,
		)
		.refine(
			(file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
			'Formato de arquivo não suportado',
		),
	backdrop: z
		.custom<File | undefined | null>(
			(val) => val === undefined || val === null || val instanceof File,
		)
		.optional()
		.refine(
			(file) => !file || file.size <= MAX_FILE_SIZE,
			`Arquivo muito grande (max 5MB)`,
		)
		.refine(
			(file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
			'Formato de arquivo não suportado',
		),
	voteCount: z.number().min(0).optional(),
})

export type CreateMovieFormData = z.infer<typeof createMovieSchema>

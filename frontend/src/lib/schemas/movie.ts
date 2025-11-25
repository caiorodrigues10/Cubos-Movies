import { z } from 'zod'

export const createMovieSchema = z.object({
	title: z.string().min(1, 'Título é obrigatório'),
	originalTitle: z.string().optional(),
	tagline: z.string().optional(),
	overview: z.string().optional(),
	releaseDate: z.string().optional(), // formato YYYY-MM-DD (input=date)
	runtime: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0),
			'Duração inválida',
		),
	genres: z.string().optional(), // separado por vírgulas
	posterUrl: z.url().optional(),
	backdropUrl: z.url().optional(),
	trailer: z.url().optional(),
	voteCount: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0),
			'Votos inválidos',
		),
})

export const updateMovieSchema = z.object({
	title: z.string().min(1, 'Título é obrigatório'),
	originalTitle: z.string().optional(),
	tagline: z.string().optional(),
	overview: z.string().optional(),
	releaseDate: z.string().optional(),
	runtime: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0),
			'Duração inválida',
		),
	genres: z.string().optional(),
	posterUrl: z.string().url().optional().or(z.literal('')),
	backdropUrl: z.string().url().optional().or(z.literal('')),
	poster: z.custom<File>().optional(),
	backdrop: z.custom<File>().optional(),
	trailer: z.string().url().optional().or(z.literal('')),
	budget: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0),
			'Orçamento inválido',
		),
	revenue: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0),
			'Receita inválida',
		),
	voteCount: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || v === '' || (/^\d+$/.test(v) && Number(v) >= 0),
			'Votos inválidos',
		),
})

export type CreateMovieFormData = z.infer<typeof createMovieSchema>
export type UpdateMovieFormData = z.infer<typeof updateMovieSchema>

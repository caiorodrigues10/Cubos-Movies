import type { FastifyInstance } from 'fastify'
import { buildSuccessResponse } from '../../../lib/httpResponse.js'
import { successResponseSchema } from '../../../lib/schemaHelpers.js'
import { Type } from '@sinclair/typebox'
import { prisma } from '../../../lib/prisma.js'

const GenreSchema = Type.String()
const GenresResponseSchema = Type.Array(GenreSchema)

export async function genreController(app: FastifyInstance) {
	app.addHook('preHandler', app.authenticate)

	app.get(
		'/',
		{
			schema: {
				tags: ['Genres'],
				summary: 'Lista todos os gêneros disponíveis',
				response: {
					200: successResponseSchema(GenresResponseSchema),
				},
			},
		},
		async (request, reply) => {
			const rows = await prisma.movie.findMany({
				where: { ownerId: request.user.sub, deletedAt: null },
				select: { genres: true },
			})

			const normalized = new Set<string>()
			for (const row of rows) {
				for (const g of row.genres ?? []) {
					const v = g.trim()
					if (v) normalized.add(v.toLowerCase())
				}
			}

			const result = Array.from(normalized)
				.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
				.map((g) => g.charAt(0).toUpperCase() + g.slice(1))

			return reply
				.status(200)
				.send(buildSuccessResponse(result, 'Gêneros listados com sucesso.'))
		},
	)
}

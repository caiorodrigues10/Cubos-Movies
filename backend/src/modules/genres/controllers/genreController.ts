import type { FastifyInstance } from 'fastify'
import { buildSuccessResponse } from '../../../lib/httpResponse.js'
import { successResponseSchema } from '../../../lib/schemaHelpers.js'
import { Type } from '@sinclair/typebox'
import { GenreRepository } from '../repositories/genreRepository.js'
import { ListGenresUseCase } from '../useCases/listGenresUseCase.js'

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
			const genreRepository = new GenreRepository()
			const listGenresUseCase = new ListGenresUseCase(genreRepository)
			const result = await listGenresUseCase.execute(request.user.sub)

			return reply
				.status(200)
				.send(buildSuccessResponse(result, 'Gêneros listados com sucesso.'))
		},
	)
}

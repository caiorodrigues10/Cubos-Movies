import type { FastifyInstance } from 'fastify'
import { buildSuccessResponse } from '../../../lib/httpResponse.js'
import {
	successResponseSchema,
	errorResponseSchema,
} from '../../../lib/schemaHelpers.js'
import {
	MovieBodySchema,
	UpdateMovieBodySchema,
	MovieParamsSchema,
	MovieListQuerySchema,
	MovieListResponseSchema,
	MovieEntitySchema,
	type MovieBody,
	type UpdateMovieBody,
	type MovieParams,
	type MovieListQuery,
} from '../dtos/movieDto.js'
import { MovieRepository } from '../repositories/movieRepository.js'
import { ListMoviesUseCase } from '../useCases/listMoviesUseCase.js'
import { GetMovieUseCase } from '../useCases/getMovieUseCase.js'
import { CreateMovieUseCase } from '../useCases/createMovieUseCase.js'
import { UpdateMovieUseCase } from '../useCases/updateMovieUseCase.js'
import { DeleteMovieUseCase } from '../useCases/deleteMovieUseCase.js'
import { Type } from '@sinclair/typebox'

export async function movieController(app: FastifyInstance) {
	const movieRepository = new MovieRepository()

	app.addHook('preHandler', app.authenticate)

	app.get<{ Querystring: MovieListQuery }>(
		'/',
		{
			schema: {
				tags: ['Movies'],
				summary: 'Lista paginada de filmes do usuário',
				querystring: MovieListQuerySchema,
				response: {
					200: successResponseSchema(MovieListResponseSchema),
				},
			},
		},
		async (request, reply) => {
			const listMoviesUseCase = new ListMoviesUseCase(movieRepository)
			const result = await listMoviesUseCase.execute({
				ownerId: request.user.sub,
				page: request.query.page,
				perPage: request.query.perPage,
				search: request.query.search,
				filters: request.query.filters,
			})

			return reply
				.status(200)
				.send(buildSuccessResponse(result, 'Filmes carregados com sucesso.'))
		},
	)

	app.get<{ Params: MovieParams }>(
		'/:id',
		{
			schema: {
				tags: ['Movies'],
				summary: 'Busca detalhes de um filme',
				params: MovieParamsSchema,
				response: {
					200: successResponseSchema(MovieEntitySchema),
					404: errorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const getMovieUseCase = new GetMovieUseCase(movieRepository)
			const movie = await getMovieUseCase.execute(
				request.params.id,
				request.user.sub,
			)

			return reply
				.status(200)
				.send(buildSuccessResponse(movie, 'Filme encontrado.'))
		},
	)

	app.post<{ Body: MovieBody }>(
		'/',
		{
			schema: {
				tags: ['Movies'],
				summary: 'Cria um filme',
				body: MovieBodySchema,
				response: {
					201: successResponseSchema(MovieEntitySchema),
					409: errorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const createMovieUseCase = new CreateMovieUseCase(movieRepository)
			const movie = await createMovieUseCase.execute(
				request.body,
				request.user.sub,
			)

			return reply
				.status(201)
				.send(buildSuccessResponse(movie, 'Filme criado com sucesso.', 201))
		},
	)

	app.put<{ Params: MovieParams; Body: UpdateMovieBody }>(
		'/:id',
		{
			schema: {
				tags: ['Movies'],
				summary: 'Atualiza um filme',
				params: MovieParamsSchema,
				body: UpdateMovieBodySchema,
				response: {
					200: successResponseSchema(MovieEntitySchema),
					404: errorResponseSchema,
					409: errorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const updateMovieUseCase = new UpdateMovieUseCase(movieRepository)
			const movie = await updateMovieUseCase.execute(
				request.params.id,
				request.body,
				request.user.sub,
			)

			return reply
				.status(200)
				.send(buildSuccessResponse(movie, 'Filme atualizado com sucesso.'))
		},
	)

	app.delete<{ Params: MovieParams }>(
		'/:id',
		{
			schema: {
				tags: ['Movies'],
				summary: 'Remove um filme',
				params: MovieParamsSchema,
				response: {
					200: successResponseSchema(
						Type.Object({
							success: Type.Boolean(),
						}),
					),
					404: errorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const deleteMovieUseCase = new DeleteMovieUseCase(movieRepository)
			await deleteMovieUseCase.execute(request.params.id, request.user.sub)

			return reply
				.status(200)
				.send(
					buildSuccessResponse(
						{ success: true },
						'Filme excluído com sucesso.',
					),
				)
		},
	)
}

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import { movieController } from '../modules/movies/controllers/movieController.js'
import { AppError, buildErrorResponse } from '../lib/httpResponse.js'

describe('Movies Routes (auth guard)', () => {
	let app: any

	beforeEach(async () => {
		app = Fastify()

		// Mock de autenticação: sempre 401
		app.decorate('authenticate', async () => {
			throw new AppError('Não autorizado', 401)
		})

		// Handler de erros para responder com o payload padronizado
		app.setErrorHandler((error: any, request: any, reply: any) => {
			if (error?.validation) {
				return reply.status(400).send(
					buildErrorResponse({
						statusCode: 400,
						message: 'Dados inválidos.',
						data: error.validation,
					}),
				)
			}

			if (error instanceof AppError) {
				return reply.status(error.statusCode).send(
					buildErrorResponse({
						statusCode: error.statusCode,
						message: error.message,
						data: (error as any).data,
					}),
				)
			}

			return reply.status(500).send(
				buildErrorResponse({
					statusCode: 500,
					message: 'Erro interno do servidor.',
				}),
			)
		})

		await app.register(movieController)
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('should return 401 when unauthenticated (GET /movies)', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/movies',
		})

		expect(response.statusCode).toBe(401)
	})
})


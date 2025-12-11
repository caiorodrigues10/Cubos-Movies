import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import { genreController } from '../modules/genres/controllers/genreController.js'
import { AppError, buildErrorResponse } from '../lib/httpResponse.js'

describe('Genres Routes (auth guard)', () => {
	let app: any

	beforeEach(async () => {
		app = Fastify()

		app.decorate('authenticate', async () => {
			throw new AppError('Não autorizado', 401)
		})

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

		await app.register(genreController, { prefix: '/genres' })
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('should return 401 when unauthenticated (GET /genres)', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/genres',
		})

		expect(response.statusCode).toBe(401)
	})
})


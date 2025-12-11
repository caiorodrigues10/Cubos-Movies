import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import { storageController } from '../modules/storage/controllers/storageController.js'
import { AppError, buildErrorResponse } from '../lib/httpResponse.js'

describe('Storage Routes (auth guard)', () => {
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

		await app.register(storageController, { prefix: '/storage' })
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('should return 401 when unauthenticated (POST /storage/presign)', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/storage/presign',
			payload: {
				fileName: 'poster.jpg',
				contentType: 'image/jpeg',
			},
		})

		expect(response.statusCode).toBe(401)
	})
})


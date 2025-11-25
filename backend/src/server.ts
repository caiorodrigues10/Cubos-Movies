import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { env } from './env.js'
import { authController } from './modules/auth/controllers/authController.js'
import { movieController } from './modules/movies/controllers/movieController.js'
import { storageController } from './modules/storage/controllers/storageController.js'
import { genreController } from './modules/genres/controllers/genreController.js'
import { reminderScheduler } from './services/reminderService.js'
import {
	AppError,
	buildErrorResponse,
	buildSuccessResponse,
} from './lib/httpResponse.js'

export async function createServer() {
	const app = Fastify({
		logger: true,
		ajv: {
			customOptions: {
				removeAdditional: true,
				coerceTypes: true,
				allErrors: true,
			},
		},
	}).withTypeProvider<TypeBoxTypeProvider>()

	await app.register(fastifyCors, {
		origin: true, // Permite todas as origens
		credentials: true,
	})

	await app.register(fastifyJwt, {
		secret: env.JWT_SECRET,
	})

	await app.register(fastifyMultipart as any, {
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB
		},
	})

	await app.register(fastifySwagger, {
		openapi: {
			info: {
				title: 'Cubos Movies API',
				description:
					'Documentação automática gerada a partir dos schemas TypeBox.',
				version: '1.0.0',
			},
		},
	})

	await app.register(fastifySwaggerUi, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'list',
			deepLinking: true,
		},
	})

	app.decorate('authenticate', async function authenticate(request) {
		try {
			await request.jwtVerify()
		} catch (error) {
			request.log.error(error)
			throw new AppError('Não autorizado', 401)
		}
	})

	app.setErrorHandler((error, request, reply) => {
		if (error.validation) {
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
					data: error.data,
				}),
			)
		}

		request.log.error(error)
		return reply.status(500).send(
			buildErrorResponse({
				statusCode: 500,
				message: 'Erro interno do servidor.',
			}),
		)
	})

	app.setNotFoundHandler((request, reply) => {
		return reply.status(404).send(
			buildErrorResponse({
				statusCode: 404,
				message: 'Rota não encontrada.',
				data: {
					method: request.method,
					url: request.url,
				},
			}),
		)
	})

	app.get('/health', async (_, reply) => {
		return reply
			.status(200)
			.send(buildSuccessResponse({ status: 'ok' }, 'Servidor saudável.'))
	})

	await app.register(authController, { prefix: '/auth' })
	await app.register(movieController, { prefix: '/movies' })
	await app.register(storageController, { prefix: '/storage' })
	await app.register(genreController, { prefix: '/genres' })

	reminderScheduler.start(app.log)

	return app
}

async function start() {
	try {
		const app = await createServer()
		await app.listen({ port: env.PORT, host: '0.0.0.0' })
		app.log.info(`HTTP server listening on http://0.0.0.0:${env.PORT}`)
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

if (env.NODE_ENV !== 'test') {
	start()
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import { authController } from '../modules/auth/controllers/authController.js'
import bcrypt from 'bcryptjs'
import { AppError, buildErrorResponse } from '../lib/httpResponse.js'

var mockPrisma: any

vi.mock('../lib/prisma.js', () => {
	const prisma = {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
		},
	}
	mockPrisma = prisma
	return { prisma }
})

describe('Auth Routes', () => {
	let app: any

	beforeEach(async () => {
		app = Fastify()
		await app.register(import('@fastify/jwt'), {
			secret: 'test-secret-key',
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

		await app.register(authController)
		await app.ready()
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await app.close()
	})

	describe('POST /register', () => {
		it('should register a new user successfully', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null)
			mockPrisma.user.create.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				passwordHash: 'hashed-password',
			})

			const response = await app.inject({
				method: 'POST',
				url: '/register',
				payload: {
					name: 'Test User',
					email: 'test@example.com',
					password: 'password123',
				},
			})

			expect(response.statusCode).toBe(201)
			const body = JSON.parse(response.body)
			expect(body.result).toBe('success')
			expect(body.data).toHaveProperty('token')
			expect(body.data.user).toEqual({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
			})

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			})
			expect(mockPrisma.user.create).toHaveBeenCalled()
		})

		it('should return 409 if email already exists', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'existing-user',
				email: 'test@example.com',
			})

			const response = await app.inject({
				method: 'POST',
				url: '/register',
				payload: {
					name: 'Test User',
					email: 'test@example.com',
					password: 'password123',
				},
			})

			expect(response.statusCode).toBe(409)
			const body = JSON.parse(response.body)
			expect(body.result).toBe('error')
			expect(body.message).toBe('E-mail já cadastrado.')
		})

		it('should normalize email to lowercase', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null)
			mockPrisma.user.create.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				passwordHash: 'hashed',
			})

			await app.inject({
				method: 'POST',
				url: '/register',
				payload: {
					name: 'Test User',
					email: 'TEST@EXAMPLE.COM',
					password: 'password123',
				},
			})

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			})
		})
	})

	describe('POST /login', () => {
		it('should login successfully with valid credentials', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10)
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				passwordHash: hashedPassword,
			})

			const response = await app.inject({
				method: 'POST',
				url: '/login',
				payload: {
					email: 'test@example.com',
					password: 'password123',
				},
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body.result).toBe('success')
			expect(body.data).toHaveProperty('token')
			expect(body.data.user.email).toBe('test@example.com')
		})

		it('should return 401 for invalid email', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null)

			const response = await app.inject({
				method: 'POST',
				url: '/login',
				payload: {
					email: 'nonexistent@example.com',
					password: 'password123',
				},
			})

			expect(response.statusCode).toBe(401)
			const body = JSON.parse(response.body)
			expect(body.result).toBe('error')
			expect(body.message).toBe('Credenciais inválidas.')
		})

		it('should return 401 for invalid password', async () => {
			const hashedPassword = await bcrypt.hash('correct-password', 10)
			mockPrisma.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				passwordHash: hashedPassword,
			})

			const response = await app.inject({
				method: 'POST',
				url: '/login',
				payload: {
					email: 'test@example.com',
					password: 'wrong-password',
				},
			})

			expect(response.statusCode).toBe(401)
			const body = JSON.parse(response.body)
			expect(body.result).toBe('error')
			expect(body.message).toBe('Credenciais inválidas.')
		})
	})
})

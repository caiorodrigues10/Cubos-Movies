import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMovieReminderEmail } from './emailService.js'

var sendMock: any

vi.mock('resend', () => {
	sendMock = vi.fn()
	class ResendMock {
		emails = { send: sendMock }
	}
	return { Resend: ResendMock }
})

describe('EmailService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		process.env.RESEND_FROM_EMAIL = 'noreply@test.com'
		process.env.RESEND_API_KEY = 'test-key'
	})

	it('should send reminder email with correct format', async () => {
		sendMock.mockResolvedValue({ id: 'email-id' })

		const releaseDate = new Date('2024-12-25')
		await sendMovieReminderEmail({
			to: 'user@example.com',
			movieTitle: 'Bumblebee',
			releaseDate,
		})

		expect(sendMock).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'user@example.com',
				// título no subject e no html
				subject: expect.stringContaining('Bumblebee'),
				html: expect.stringContaining('Bumblebee'),
			}),
		)
	})

	it('should format release date correctly', async () => {
		sendMock.mockResolvedValue({ id: 'email-id' })

		// Usa horário de meio-dia UTC para evitar mudança de dia por fuso local
		const releaseDate = new Date('2024-12-25T12:00:00Z')
		await sendMovieReminderEmail({
			to: 'user@example.com',
			movieTitle: 'Test Movie',
			releaseDate,
		})

		const callArgs = sendMock.mock.calls[0][0]
		expect(callArgs.html).toContain('25/12/2024')
	})
})


import { describe, it, expect, vi, beforeEach } from 'vitest'

var mockGetSignedUrl: any
var mockFile: any
var mockBucket: any

vi.mock('@google-cloud/storage', () => {
	const getSignedUrl = vi.fn()
	const file = { getSignedUrl, save: vi.fn(), download: vi.fn() }
	const bucket = { file: vi.fn(() => file) }

	mockGetSignedUrl = getSignedUrl
	mockFile = file
	mockBucket = bucket

	class Storage {
		bucket = vi.fn(() => bucket)
	}

	return { Storage }
})

vi.mock('../env.js', () => ({
	env: {
		GCP_PROJECT_ID: 'test-project',
		GCP_BUCKET_NAME: 'test-bucket',
		GCP_CLIENT_EMAIL: 'svc@test-project.iam.gserviceaccount.com',
		GCP_PRIVATE_KEY: 'test-key',
		GCP_SIGNED_URL_EXPIRATION: 300,
	},
}))

import { storageService } from './storageService.js'

describe('StorageService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockGetSignedUrl.mockResolvedValue([
			'https://storage.googleapis.com/upload-url',
		])
	})

	it('should create presigned upload URL', async () => {
		const result = await storageService.createPresignedUpload({
			fileName: 'poster.jpg',
			contentType: 'image/jpeg',
			ownerId: 'user-123',
		})

		expect(result).toHaveProperty('key')
		expect(result).toHaveProperty(
			'uploadUrl',
			'https://storage.googleapis.com/upload-url',
		)
		expect(result).toHaveProperty(
			'objectUrl',
			'https://storage.googleapis.com/test-bucket/' + result.key,
		)
		expect(result.key).toContain('users/user-123/')
		expect(result.key).toContain('.jpg')
	})

	it('should generate unique keys for each upload', async () => {
		const result1 = await storageService.createPresignedUpload({
			fileName: 'poster1.jpg',
			contentType: 'image/jpeg',
			ownerId: 'user-123',
		})

		const result2 = await storageService.createPresignedUpload({
			fileName: 'poster2.jpg',
			contentType: 'image/jpeg',
			ownerId: 'user-123',
		})

		expect(result1.key).not.toBe(result2.key)
	})

	it('should preserve file extension', async () => {
		const result = await storageService.createPresignedUpload({
			fileName: 'movie.poster.png',
			contentType: 'image/png',
			ownerId: 'user-123',
		})

		expect(result.key).toContain('.png')
	})
})


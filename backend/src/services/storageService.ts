import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import { Storage } from '@google-cloud/storage'
import { env } from '../env.js'

const storage = new Storage({
	projectId: env.GCP_PROJECT_ID,
	credentials: {
		client_email: env.GCP_CLIENT_EMAIL,
		private_key: env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
	},
})

class StorageService {
	private readonly bucket = storage.bucket(env.GCP_BUCKET_NAME)

	async createPresignedUpload({
		fileName,
		contentType,
		ownerId,
	}: {
		fileName: string
		contentType: string
		ownerId: string
	}) {
		const extension = extname(fileName)
		const key = `users/${ownerId}/${randomUUID()}${extension}`
		const file = this.bucket.file(key)

		const [uploadUrl] = await file.getSignedUrl({
			version: 'v4',
			action: 'write',
			expires: Date.now() + env.GCP_SIGNED_URL_EXPIRATION * 1000,
			contentType,
		})

		return {
			key,
			uploadUrl,
			objectUrl: this.buildPublicUrl(key),
		}
	}

	async getSignedReadUrl(key: string): Promise<string> {
		const file = this.bucket.file(key)
		const [signedUrl] = await file.getSignedUrl({
			version: 'v4',
			action: 'read',
			expires: Date.now() + env.GCP_SIGNED_URL_EXPIRATION * 1000,
		})
		return signedUrl
	}

	async getFileBuffer(key: string): Promise<Buffer> {
		const file = this.bucket.file(key)
		const [buffer] = await file.download()
		return buffer
	}

	async uploadFile({
		buffer,
		fileName,
		contentType,
		ownerId,
	}: {
		buffer: Buffer
		fileName: string
		contentType: string
		ownerId: string
	}): Promise<string> {
		const extension = extname(fileName)
		const key = `users/${ownerId}/${randomUUID()}${extension}`
		const file = this.bucket.file(key)

		await file.save(buffer, {
			metadata: {
				contentType,
			},
		})

		return this.buildPublicUrl(key)
	}

	extractKeyFromUrl(url: string): string | null {
		const pattern = new RegExp(
			`https://storage\\.googleapis\\.com/${env.GCP_BUCKET_NAME}/(.+)`,
		)
		const match = url.match(pattern)
		return match ? match[1] : null
	}

	private buildPublicUrl(key: string) {
		return `https://storage.googleapis.com/${env.GCP_BUCKET_NAME}/${key}`
	}
}

export const storageService = new StorageService()

import { storageService } from '../../../services/storageService.js'

export class UploadFileUseCase {
	async execute(
		buffer: Buffer,
		fileName: string,
		contentType: string,
		ownerId: string,
	): Promise<string> {
		return storageService.uploadFile({
			buffer,
			fileName,
			contentType,
			ownerId,
		})
	}
}

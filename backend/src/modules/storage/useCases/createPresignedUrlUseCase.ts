import type { PresignBody, PresignResponse } from "../dtos/storageDto.js";
import { storageService } from "../../../services/storageService.js";

export class CreatePresignedUrlUseCase {
  async execute(data: PresignBody, ownerId: string): Promise<PresignResponse> {
    return storageService.createPresignedUpload({
      fileName: data.fileName,
      contentType: data.contentType,
      ownerId,
    });
  }
}


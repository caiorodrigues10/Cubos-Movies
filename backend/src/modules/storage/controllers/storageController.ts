import type { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { buildSuccessResponse, AppError } from "../../../lib/httpResponse.js";
import { successResponseSchema } from "../../../lib/schemaHelpers.js";
import {
  PresignBodySchema,
  PresignResponseSchema,
  type PresignBody,
} from "../dtos/storageDto.js";
import { CreatePresignedUrlUseCase } from "../useCases/createPresignedUrlUseCase.js";
import { UploadFileUseCase } from "../useCases/uploadFileUseCase.js";
import { storageService } from "../../../services/storageService.js";

const ProxyQuerySchema = Type.Object(
  {
    url: Type.String({ format: "uri" }),
  },
  { additionalProperties: false }
);

export async function storageController(app: FastifyInstance) {
  app.post<{ Body: PresignBody }>(
    "/presign",
    {
      preHandler: app.authenticate,
      schema: {
        tags: ["Storage"],
        summary: "Gera uma URL pré-assinada para upload no Google Cloud Storage",
        body: PresignBodySchema,
        response: {
          200: successResponseSchema(PresignResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const createPresignedUrlUseCase = new CreatePresignedUrlUseCase();
      const payload = await createPresignedUrlUseCase.execute(
        request.body,
        request.user.sub
      );

      return reply
        .status(200)
        .send(
          buildSuccessResponse(
            payload,
            "URL pré-assinada gerada com sucesso."
          )
        );
    }
  );

  app.get<{ Querystring: { url: string } }>(
    "/proxy",
    {
      schema: {
        tags: ["Storage"],
        summary: "Serve imagens do Google Cloud Storage como proxy",
        querystring: ProxyQuerySchema,
      },
    },
    async (request, reply) => {
      const { url } = request.query;

      if (!url) {
        throw new AppError("URL é obrigatória.", 400);
      }

      const key = storageService.extractKeyFromUrl(url);
      if (!key) {
        throw new AppError("URL inválida do Google Cloud Storage.", 400);
      }

      try {
        const buffer = await storageService.getFileBuffer(key);
        // Tenta determinar o content type pela extensão do arquivo
        const extension = key.split('.').pop()?.toLowerCase();
        const contentTypeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
        };
        const contentType = contentTypeMap[extension || ''] || 'image/jpeg';

        return reply
          .type(contentType)
          .header("Cache-Control", "public, max-age=31536000")
          .send(buffer);
      } catch (error: any) {
        if (error.code === 404) {
          throw new AppError("Imagem não encontrada.", 404);
        }
        throw new AppError("Erro ao buscar imagem.", 500);
      }
    }
  );

  app.post(
    "/upload",
    {
      preHandler: app.authenticate,
      schema: {
        tags: ["Storage"],
        summary: "Faz upload de arquivo diretamente através do backend",
        consumes: ["multipart/form-data"],
        response: {
          200: successResponseSchema(
            Type.Object({
              objectUrl: Type.String({ format: "uri" }),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const data = await request.file();

      if (!data) {
        throw new AppError("Arquivo é obrigatório.", 400);
      }

      const buffer = await data.toBuffer();
      const fileName = data.filename || "file";
      const contentType = data.mimetype || "application/octet-stream";

      // Validar se é uma imagem
      if (!contentType.startsWith("image/")) {
        throw new AppError("Apenas imagens são permitidas.", 400);
      }

      const uploadFileUseCase = new UploadFileUseCase();
      const objectUrl = await uploadFileUseCase.execute(
        buffer,
        fileName,
        contentType,
        request.user.sub
      );

      return reply
        .status(200)
        .send(
          buildSuccessResponse(
            { objectUrl },
            "Arquivo enviado com sucesso."
          )
        );
    }
  );
}


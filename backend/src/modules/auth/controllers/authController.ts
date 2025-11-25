import type { FastifyInstance } from "fastify";
import { buildSuccessResponse } from "../../../lib/httpResponse.js";
import { successResponseSchema, errorResponseSchema } from "../../../lib/schemaHelpers.js";
import {
  RegisterBodySchema,
  LoginBodySchema,
  AuthPayloadSchema,
  type RegisterBody,
  type LoginBody,
} from "../dtos/authDto.js";
import { UserRepository } from "../repositories/userRepository.js";
import { RegisterUseCase } from "../useCases/registerUseCase.js";
import { LoginUseCase } from "../useCases/loginUseCase.js";

export async function authController(app: FastifyInstance) {
  const userRepository = new UserRepository();

  app.post<{ Body: RegisterBody }>(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Cadastro de usuário",
        body: RegisterBodySchema,
        response: {
          201: successResponseSchema(AuthPayloadSchema),
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const registerUseCase = new RegisterUseCase(userRepository, app);
      const payload = await registerUseCase.execute(request.body);

      return reply
        .status(201)
        .send(buildSuccessResponse(payload, "Usuário criado com sucesso.", 201));
    }
  );

  app.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login no sistema",
        body: LoginBodySchema,
        response: {
          200: successResponseSchema(AuthPayloadSchema),
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const loginUseCase = new LoginUseCase(userRepository, app);
      const payload = await loginUseCase.execute(request.body);

      return reply
        .status(200)
        .send(buildSuccessResponse(payload, "Login realizado com sucesso."));
    }
  );
}


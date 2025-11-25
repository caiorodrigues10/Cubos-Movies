import bcrypt from "bcryptjs";
import { AppError } from "../../../lib/httpResponse.js";
import type { IUserRepository } from "../repositories/userRepository.js";
import type { LoginBody, AuthPayload } from "../dtos/authDto.js";
import type { FastifyInstance } from "fastify";

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private app: FastifyInstance
  ) {}

  async execute(data: LoginBody): Promise<AuthPayload> {
    const normalizedEmail = data.email.toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const token = this.app.jwt.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}


import bcrypt from "bcryptjs";
import { AppError } from "../../../lib/httpResponse.js";
import type { IUserRepository } from "../repositories/userRepository.js";
import type { RegisterBody, AuthPayload } from "../dtos/authDto.js";
import type { FastifyInstance } from "fastify";

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private app: FastifyInstance
  ) {}

  async execute(data: RegisterBody): Promise<AuthPayload> {
    const normalizedEmail = data.email.toLowerCase();
    const trimmedName = data.name.trim();

    const existing = await this.userRepository.findByEmail(normalizedEmail);

    if (existing) {
      throw new AppError("E-mail já cadastrado.", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      email: normalizedEmail,
      name: trimmedName,
      passwordHash,
    });

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


import { apiRequest, HttpMethod } from '@/services/Api';
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
	return apiRequest<AuthResponse>(`/auth/login`, {
		method: HttpMethod.POST,
		body: JSON.stringify(payload),
	})
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
	return apiRequest<AuthResponse>(`/auth/register`, {
		method: HttpMethod.POST,
		body: JSON.stringify(payload),
	})
}

export async function setCookies(token: string, userId: string): Promise<void> {
	const response = await fetch("/api/auth/set-cookies", {
		method: HttpMethod.POST,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token, userId }),
	})

	if (!response.ok) {
		throw new Error("Erro ao salvar cookies");
	}
}


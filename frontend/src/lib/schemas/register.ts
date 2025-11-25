import { z } from 'zod'

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(1, 'Nome é obrigatório')
			.min(2, 'Nome deve ter pelo menos 2 caracteres'),
		email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
		password: z
			.string()
			.min(1, 'Senha é obrigatória')
			.min(6, 'Senha deve ter pelo menos 6 caracteres'),
		confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas não coincidem',
		path: ['confirmPassword'],
	})

export type RegisterFormData = z.infer<typeof registerSchema>

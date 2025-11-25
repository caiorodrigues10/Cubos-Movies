'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register as registerUser, setCookies } from '../../services/auth'
import { registerSchema, type RegisterFormData } from '@/lib/schemas/register'
import { showToast } from '@/lib/toast'
import { Card, CardContent, CardFooter } from '../ui/Card'
import { Input, InputContainer, InputLabel, InputError } from '../ui/Input'
import { Button } from '../ui/Button'
import Link from 'next/link'

export function RegisterForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true)

		try {
			const result = await registerUser({
				name: data.name,
				email: data.email,
				password: data.password,
			})

			await setCookies(result.token, result.user.id)

			showToast({
				message: 'Conta criada com sucesso!',
				type: 'success',
			})

			router.push('/movies')
		} catch (error: unknown) {
			let errorMessage = 'Erro de conexão. Tente novamente.'

			if (error instanceof Error) {
				errorMessage = error.message
				if (errorMessage === 'Failed to fetch') {
					errorMessage = 'Erro de conexão. Tente novamente mais tarde.'
				}
			}

			showToast({
				message: errorMessage,
				type: 'error',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full px-4 py-8 sm:py-16">
			<div className="mx-auto w-full max-w-md">
				<Card className="shadow-sm">
					<form onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-6 pt-4">
								<InputContainer>
									<InputLabel htmlFor="name">Nome</InputLabel>
									<Input
										id="name"
										type="text"
										placeholder="Seu nome"
									{...register('name')}
									error={!!errors.name}
								/>
								<InputError
										error={!!errors.name}
									errorMessage={errors.name?.message}
								/>
								</InputContainer>

								<InputContainer>
									<InputLabel htmlFor="email">E-mail</InputLabel>
									<Input
										id="email"
										type="email"
										placeholder="Digite seu e-mail"
									{...register('email')}
									error={!!errors.email}
								/>
								<InputError
										error={!!errors.email}
									errorMessage={errors.email?.message}
								/>
								</InputContainer>

								<InputContainer>
									<InputLabel htmlFor="password">Senha</InputLabel>
									<Input
										id="password"
										type="password"
										placeholder="Digite sua senha"
									{...register('password')}
									error={!!errors.password}
								/>
								<InputError
										error={!!errors.password}
									errorMessage={errors.password?.message}
								/>
								</InputContainer>

							<InputContainer>
								<InputLabel htmlFor="confirmPassword">
									Confirmar Senha
								</InputLabel>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Confirme sua senha"
									{...register('confirmPassword')}
									error={!!errors.confirmPassword}
								/>
								<InputError
									error={!!errors.confirmPassword}
									errorMessage={errors.confirmPassword?.message}
								/>
							</InputContainer>

							<div className="flex justify-end">
								<Button type="submit" className="w-fit" disabled={isLoading}>
									{isLoading ? 'Cadastrando...' : 'Cadastrar'}
								</Button>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col items-center space-y-2">
							<div className="flex items-center w-full">
								<div className="flex-1 border-t border-[--color-border]"></div>
								<p className="text-sm text-[--color-muted-foreground] px-4">
									Já possui cadastro?
								</p>
								<div className="flex-1 border-t border-[--color-border]"></div>
							</div>

							<Link
								href="/login"
								className="text-sm font-medium hover:underline text-primary"
							>
								Entrar
							</Link>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	)
}

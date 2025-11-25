'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, setCookies } from '../../services/auth'
import { Card, CardContent, CardFooter } from '../ui/Card'
import { Input, InputError, InputLabel, InputControl } from '../ui/Input'
import { Button } from '../ui/Button'
import Link from 'next/link'
import { loginSchema, type LoginFormData } from '@/lib/schemas/login'
import { showToast } from '@/lib/toast'

export function LoginForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true)

		try {
			const result = await login({
				email: data.email,
				password: data.password,
			})

			await setCookies(result.token, result.user.id)

			showToast({
				message: 'Login realizado com sucesso!',
				type: 'success',
			})

			router.push('/movies')
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erro de conexão. Tente novamente.'

			let showMessage = ''
			switch (errorMessage) {
				case 'Invalid credentials':
				case 'Credenciais inválidas':
					showMessage = 'E-mail ou senha inválidos'
					break
				case 'Failed to fetch':
					showMessage = 'Erro de conexão. Tente novamente mais tarde.'
					break
				default:
					showMessage = errorMessage
					break
			}

			showToast({
				message: showMessage,
				type: 'error',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full px-4 py-8 sm:py-16 min-h-[calc(100vh-56px-68px)] flex items-center justify-center">
			<div className="mx-auto w-full max-w-md">
				<Card className="shadow-sm bg-[--color-card] p-4">
					<form onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-4 p-0!">
							<div className="space-y-2">
								<InputLabel htmlFor="email">E-mail</InputLabel>
								<InputControl>
									<Input
										id="email"
										type="email"
										placeholder="Digite seu e-mail"
										{...register('email')}
									/>
								</InputControl>
								<InputError
									error={!!errors.email}
									errorMessage={errors.email?.message}
								/>
							</div>

							<div className="space-y-2">
								<InputLabel htmlFor="password">Senha</InputLabel>
								<InputControl>
									<Input
										id="password"
										type="password"
										placeholder="Digite sua senha"
										{...register('password')}
									/>
								</InputControl>
								<InputError
									error={!!errors.password}
									errorMessage={errors.password?.message}
								/>
							</div>


							<div className="pt-2 flex justify-between items-center gap-2">
								<Link href="#" className="text-sm hover:underline text-primary">
									Esqueceu sua senha?
								</Link>
								<Button type="submit" className="w-fit" disabled={isLoading}>
									{isLoading ? 'Entrando...' : 'Entrar'}
								</Button>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col items-center space-y-2 p-0! pt-4!">
							<div className="flex items-center w-full">
								<div className="flex-1 border-t border-[--color-border]"></div>
								<p className="text-sm text-[--color-muted-foreground] px-4">
									Não possui cadastro?
								</p>
								<div className="flex-1 border-t border-[--color-border]"></div>
							</div>

							<Link
								href="/register"
								className="text-sm font-medium hover:underline text-primary"
							>
								Criar uma conta
							</Link>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	)
}

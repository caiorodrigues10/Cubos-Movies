'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createMovie } from '@/services/movies'
import { showToast } from '@/lib/toast'
import { revalidateMoviesList } from '../actions'
import {
	createMovieSchema,
	type CreateMovieFormData,
} from '@/lib/schemas/movie'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Input, InputError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function NewMoviePage() {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateMovieFormData>({
		resolver: zodResolver(createMovieSchema),
		defaultValues: {
			title: '',
			originalTitle: '',
			tagline: '',
			overview: '',
			releaseDate: '',
			runtime: '',
			genres: '',
			posterUrl: '',
			backdropUrl: '',
			trailer: '',
		},
	})

	const onSubmit = async (data: CreateMovieFormData) => {
		setIsSubmitting(true)

		try {
			const payload = {
				title: data.title,
				originalTitle: data.originalTitle?.trim() || undefined,
				tagline: data.tagline?.trim() || undefined,
				overview: data.overview?.trim() || undefined,
				releaseDate: data.releaseDate?.trim() || undefined,
				runtime:
					data.runtime && data.runtime !== ''
						? Number(data.runtime)
						: undefined,
				genres: data.genres
					? data.genres
							.split(',')
							.map((g) => g.trim().toLowerCase())
							.filter(Boolean)
					: undefined,
				posterUrl: data.posterUrl?.toString().trim() || undefined,
				backdropUrl: data.backdropUrl?.toString().trim() || undefined,
				trailer: data.trailer?.toString().trim() || undefined,
			}

			const movie = await createMovie(payload)

			showToast({
				message: 'Filme criado com sucesso!',
				type: 'success',
			})

			// Revalidar a rota de listagem de filmes
			await revalidateMoviesList()

			router.push(`/movies/${movie.id}`)
		} catch (err) {
			const errorMessage = (err as Error)?.message ?? 'Erro ao criar filme.'
			showToast({
				message: errorMessage,
				type: 'error',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="w-full px-4 py-8 sm:py-16">
			<div className="mx-auto w-full max-w-2xl">
				<Card className="shadow-sm">
					<CardHeader className="space-y-0">
						<CardTitle className="text-xl font-semibold">
							Adicionar Filme
						</CardTitle>
						<CardDescription className="text-md">
							Preencha os dados para cadastrar um novo filme.
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="title">Título</Label>
								<Input
									id="title"
									placeholder="Título"
									{...register('title')}
									error={!!errors.title}
								/>
								<InputError error errorMessage={errors.title?.message} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="tagline">Tagline</Label>
								<Input
									id="tagline"
									placeholder="Todo herói tem um começo."
									{...register('tagline')}
									error={!!errors.tagline}
								/>
								<InputError
									error={!!errors.tagline}
									errorMessage={errors.tagline?.message}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="originalTitle">Título original</Label>
								<Input
									id="originalTitle"
									placeholder="Título original"
									{...register('originalTitle')}
									error={!!errors.originalTitle}
								/>
								<InputError
									error={!!errors.originalTitle}
									errorMessage={errors.originalTitle?.message}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="overview">Sinopse</Label>
								<textarea
									id="overview"
									rows={4}
									placeholder="Sinopse"
									className="w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 outline-none"
									{...register('overview')}
								/>
								{errors.overview && (
									<span className="text-red-600 text-sm">
										{errors.overview.message}
									</span>
								)}
							</div>

							<div className="grid gap-3 sm:grid-cols-3">
								<div className="space-y-2">
									<Label htmlFor="releaseDate">Data de lançamento</Label>
									<input
										id="releaseDate"
										type="date"
										placeholder="Data de lançamento"
										className="rounded-md border border-[--color-border] bg-transparent px-3 py-2 outline-none"
										{...register('releaseDate')}
									/>
									{errors.releaseDate && (
										<span className="text-red-600 text-sm">
											{errors.releaseDate.message}
										</span>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="runtime">Duração (min)</Label>
									<input
										id="runtime"
										type="number"
										placeholder="Duração (min)"
										className="rounded-md border border-[--color-border] bg-transparent px-3 py-2 outline-none"
										{...register('runtime')}
									/>
									{errors.runtime && (
										<span className="text-red-600 text-sm">
											{errors.runtime.message}
										</span>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="genres">Gêneros (vírgula)</Label>
									<Input
										id="genres"
										placeholder="ex.: ação, drama, comédia"
										{...register('genres')}
										error={!!errors.genres}
									/>
									<InputError
										error={!!errors.genres}
										errorMessage={errors.genres?.message}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="posterUrl">Poster URL</Label>
								<Input
									id="posterUrl"
									placeholder="https://..."
									{...register('posterUrl')}
									error={!!errors.posterUrl}
								/>
								<InputError
									error={!!errors.posterUrl}
									errorMessage={errors.posterUrl?.message}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="backdropUrl">Splash Art URL</Label>
								<Input
									id="backdropUrl"
									placeholder="https://..."
									{...register('backdropUrl')}
									error={!!errors.backdropUrl}
								/>
								<InputError
									error={!!errors.backdropUrl}
									errorMessage={errors.backdropUrl?.message}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="trailer">Trailer (YouTube URL)</Label>
								<Input
									id="trailer"
									placeholder="https://www.youtube.com/watch?v=..."
									{...register('trailer')}
									error={!!errors.trailer}
								/>
								<InputError
									error={!!errors.trailer}
									errorMessage={errors.trailer?.message}
								/>
							</div>
						</CardContent>

						<CardFooter className="flex justify-end">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Salvando...' : 'Salvar'}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	)
}

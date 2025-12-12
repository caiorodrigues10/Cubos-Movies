'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	updateMovieSchema,
	type UpdateMovieFormData,
} from '@/lib/schemas/movie'
import { Button } from '@/components/ui/Button'
import {
	Input,
	InputContainer,
	InputError,
	InputLabel,
} from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Select, SelectLabel } from '@/components/ui/Select'
import { getGenres } from '@/services/genres'
import { updateMovie } from '@/services/movies'
import { uploadImageViaPresign } from '@/services/storage'
import { showToast } from '@/lib/toast'
import Image from 'next/image'
import type { Movie } from '@/services/movies/types'
import { getProxiedImageUrl } from '@/lib/imageProxy'
import { revalidateMoviesList } from '@/app/(protected)/movies/actions'

interface EditMovieFormProps {
	movie: Movie
	onCancel: () => void
	onSuccess?: () => void
}

export function EditMovieForm({
	movie,
	onCancel,
	onSuccess,
}: EditMovieFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [genres, setGenres] = useState<string[]>([])
	const [isLoadingGenres, setIsLoadingGenres] = useState(true)
	const [selectedGenres, setSelectedGenres] = useState<string[]>([])

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<UpdateMovieFormData>({
		resolver: zodResolver(updateMovieSchema),
		defaultValues: {
			title: movie.title || '',
			originalTitle: movie.originalTitle || '',
			tagline: movie.tagline || '',
			overview: movie.overview || '',
			releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
			runtime: movie.runtime ? String(movie.runtime) : '',
			genres: (movie.genres || []).join(', '),
			budget: movie.budget != null ? String(movie.budget) : '',
			revenue: movie.revenue != null ? String(movie.revenue) : '',
			posterUrl: movie.posterUrl || '',
			backdropUrl: movie.backdropUrl || '',
			poster: undefined,
			backdrop: undefined,
			trailer: movie.trailer || '',
		},
	})
	// URLs proxied para exibir preview mesmo com bucket privado
	const proxiedPosterUrl = getProxiedImageUrl(movie.posterUrl)
	const proxiedBackdropUrl = getProxiedImageUrl(movie.backdropUrl)


	useEffect(() => {
		if (movie.genres) {
			setSelectedGenres(movie.genres)
		}
	}, [movie])

	useEffect(() => {
		async function fetchGenres() {
			try {
				setIsLoadingGenres(true)
				const genresList = await getGenres()
				setGenres(genresList)
			} catch (error) {
				console.error('Erro ao buscar gêneros:', error)
			} finally {
				setIsLoadingGenres(false)
			}
		}
		fetchGenres()
	}, [])

	const handleAddGenre = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const genre = e.target.value
		if (genre && !selectedGenres.includes(genre)) {
			const newGenres = [...selectedGenres, genre]
			setSelectedGenres(newGenres)
			setValue('genres', newGenres.join(', '), { shouldValidate: true })
		}
		e.target.value = ''
	}

	const handleRemoveGenre = (genreToRemove: string) => {
		const newGenres = selectedGenres.filter((g) => g !== genreToRemove)
		setSelectedGenres(newGenres)
		setValue('genres', newGenres.join(', '), { shouldValidate: true })
	}

	const onSubmit = async (data: UpdateMovieFormData) => {
		setIsSubmitting(true)
		try {
			let posterUrl: string | undefined = movie.posterUrl || undefined
			let backdropUrl: string | undefined = movie.backdropUrl || undefined

			const posterFile = watch('poster') as File | undefined
			const backdropFile = watch('backdrop') as File | undefined

			if (posterFile instanceof File) {
				posterUrl = await uploadImageViaPresign(posterFile)
			}
			if (backdropFile instanceof File) {
				backdropUrl = await uploadImageViaPresign(backdropFile)
			}

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
				budget:
					data.budget && data.budget !== '' ? Number(data.budget) : undefined,
				revenue:
					data.revenue && data.revenue !== ''
						? Number(data.revenue)
						: undefined,
				genres: selectedGenres.length > 0 ? selectedGenres : undefined,
				posterUrl,
				backdropUrl,
				trailer: data.trailer?.toString().trim() || undefined,
			}

			await updateMovie(movie.id, payload)

			showToast({
				message: 'Filme atualizado com sucesso!',
				type: 'success',
			})

			// Revalidar a rota de listagem de filmes
			await revalidateMoviesList()

			onSuccess?.()
			onCancel()
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Erro ao atualizar filme.'
			showToast({
				message: errorMessage,
				type: 'error',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
			<div className="flex-1 space-y-6 pb-6">
				<div className="space-y-2">
					<InputLabel>Pôster do Filme</InputLabel>
					<ImageUpload
						value={watch('poster') as File | undefined}
						onChange={(file) =>
							setValue('poster', file as File, { shouldValidate: true })
						}
						error={!!errors.poster}
						currentImageUrl={proxiedPosterUrl || undefined}
					/>
					<InputError
						error={!!errors.poster}
						errorMessage={errors.poster?.message}
					/>
				</div>

				<InputContainer>
					<InputLabel htmlFor="tagline">Tagline</InputLabel>
					<Input
						id="tagline"
						placeholder="Todo herói tem um começo."
						error={!!errors.tagline}
						{...register('tagline')}
					/>
					<InputError
						error={!!errors.tagline}
						errorMessage={errors.tagline?.message}
					/>
				</InputContainer>

				<div className="space-y-2">
					<InputLabel>Splash Art (fundo)</InputLabel>
					<ImageUpload
						value={watch('backdrop') as File | undefined}
						onChange={(file) =>
							setValue('backdrop', file as File, { shouldValidate: true })
						}
						error={!!errors.backdrop}
						currentImageUrl={proxiedBackdropUrl || undefined}
					/>
					<InputError
						error={!!errors.backdrop}
						errorMessage={errors.backdrop?.message}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<InputContainer>
						<InputLabel htmlFor="title">Título</InputLabel>
						<Input
							id="title"
							placeholder="Matrix"
							error={!!errors.title}
							{...register('title')}
						/>
						<InputError
							error={!!errors.title}
							errorMessage={errors.title?.message}
						/>
					</InputContainer>

					<InputContainer>
						<InputLabel htmlFor="originalTitle">Título Original</InputLabel>
						<Input
							id="originalTitle"
							placeholder="The Matrix"
							error={!!errors.originalTitle}
							{...register('originalTitle')}
						/>
						<InputError
							error={!!errors.originalTitle}
							errorMessage={errors.originalTitle?.message}
						/>
					</InputContainer>
				</div>

				<InputContainer>
					<SelectLabel htmlFor="genre-select">Gêneros</SelectLabel>
					<Select
						id="genre-select"
						onChange={handleAddGenre}
						defaultValue=""
						error={!!errors.genres}
						disabled={isLoadingGenres}
					>
						<option value="" disabled>
							{isLoadingGenres ? 'Carregando...' : 'Selecione um gênero'}
						</option>
						{genres.map((genre) => (
							<option
								key={genre}
								value={genre}
								disabled={selectedGenres.includes(genre)}
							>
								{genre}
							</option>
						))}
					</Select>

					<div className="mt-2 flex flex-wrap gap-2">
						{selectedGenres.map((genre) => (
							<span
								key={genre}
								className="inline-flex items-center gap-1 rounded-full bg-[--color-primary] px-3 py-1 text-xs font-medium text-[--color-primary-foreground]"
							>
								{genre}
								<button
									type="button"
									onClick={() => handleRemoveGenre(genre)}
									className="ml-1 hover:opacity-75"
								>
									<Image
										src="/images/Close.png"
										alt="Remover"
										width={12}
										height={12}
										className="invert"
									/>
								</button>
							</span>
						))}
					</div>
					<input type="hidden" {...register('genres')} />

					<InputError
						error={!!errors.genres}
						errorMessage={errors.genres?.message}
					/>
				</InputContainer>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<InputContainer>
						<InputLabel htmlFor="releaseDate">Data de Lançamento</InputLabel>
						<Input
							id="releaseDate"
							type="date"
							error={!!errors.releaseDate}
							{...register('releaseDate')}
						/>
						<InputError
							error={!!errors.releaseDate}
							errorMessage={errors.releaseDate?.message}
						/>
					</InputContainer>

					<InputContainer>
						<InputLabel htmlFor="runtime">Duração (minutos)</InputLabel>
						<Input
							id="runtime"
							type="number"
							placeholder="136"
							error={!!errors.runtime}
							{...register('runtime')}
						/>
						<InputError
							error={!!errors.runtime}
							errorMessage={errors.runtime?.message}
						/>
					</InputContainer>
				</div>

				<InputContainer>
					<InputLabel htmlFor="overview">Sinopse</InputLabel>
					<Textarea
						id="overview"
						placeholder="Em um futuro distópico..."
						error={!!errors.overview}
						{...register('overview')}
					/>
					<InputError
						error={!!errors.overview}
						errorMessage={errors.overview?.message}
					/>
				</InputContainer>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<InputContainer>
						<InputLabel htmlFor="budget">Orçamento ($)</InputLabel>
						<Input
							id="budget"
							type="number"
							placeholder="63000000"
							error={!!errors.budget}
							{...register('budget')}
						/>
						<InputError
							error={!!errors.budget}
							errorMessage={errors.budget?.message}
						/>
					</InputContainer>

					<InputContainer>
						<InputLabel htmlFor="revenue">Receita ($)</InputLabel>
						<Input
							id="revenue"
							type="number"
							placeholder="463517383"
							error={!!errors.revenue}
							{...register('revenue')}
						/>
						<InputError
							error={!!errors.revenue}
							errorMessage={errors.revenue?.message}
						/>
					</InputContainer>
				</div>

				<InputContainer>
					<InputLabel htmlFor="trailer">Trailer (URL do YouTube)</InputLabel>
					<Input
						id="trailer"
						placeholder="https://youtube.com/watch?v=..."
						error={!!errors.trailer}
						{...register('trailer')}
					/>
					<InputError
						error={!!errors.trailer}
						errorMessage={errors.trailer?.message}
					/>
				</InputContainer>
			</div>

			<div className="sticky -bottom-6 mt-6 flex justify-end gap-3 bg-[#faf9fb] dark:bg-[#232225] py-6">
				<Button
					type="button"
					variant="secondary"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancelar
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
				</Button>
			</div>
		</form>
	)
}

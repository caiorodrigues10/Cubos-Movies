"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMovieById, updateMovie } from "@/services/movies";
import type { Movie } from "@/services/movies/types";
import { updateMovieSchema, type UpdateMovieFormData } from "@/lib/schemas/movie";
import { showToast } from "@/lib/toast";
import { revalidateMoviesList } from "../../actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input, InputError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EditMoviePageProps {
	params: { id: string };
}

export default function EditMoviePage({ params }: EditMoviePageProps) {
	const router = useRouter();
	const [movie, setMovie] = useState<Movie | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateMovieFormData>({
		resolver: zodResolver(updateMovieSchema),
		defaultValues: {
			title: "",
			originalTitle: "",
			overview: "",
			releaseDate: "",
			runtime: "",
			genres: "",
			posterUrl: "",
			trailer: "",
		},
	});

	useEffect(() => {
		let active = true;
		setIsLoading(true);

		getMovieById(params.id)
			.then((data) => {
				if (!active) return;
				setMovie(data);
				reset({
					title: data.title ?? "",
					originalTitle: data.originalTitle ?? "",
					overview: data.overview ?? "",
					releaseDate: data.releaseDate ?? "",
					runtime: data.runtime != null ? String(data.runtime) : "",
					genres: (data.genres ?? []).join(","),
					posterUrl: data.posterUrl ?? "",
					trailer: data.trailer ?? "",
				});
			})
			.catch((err) => {
				if (!active) return;
				const errorMessage = err?.message ?? "Não foi possível carregar o filme.";
				showToast({
					message: errorMessage,
					type: 'error',
				});
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});

		return () => {
			active = false;
		};
	}, [params.id, reset]);

	const onSubmit = async (data: UpdateMovieFormData) => {
		setIsSubmitting(true);

		try {
			const payload = {
				title: data.title,
				originalTitle: data.originalTitle?.trim() || undefined,
				overview: data.overview?.trim() || undefined,
				releaseDate: data.releaseDate?.trim() || undefined,
				runtime: data.runtime && data.runtime !== "" ? Number(data.runtime) : undefined,
				genres: data.genres
					? data.genres
						.split(",")
						.map((g) => g.trim().toLowerCase())
						.filter(Boolean)
					: undefined,
				posterUrl: data.posterUrl?.toString().trim() || undefined,
				trailer: data.trailer?.toString().trim() || undefined,
			};

			await updateMovie(params.id, payload);

			showToast({
				message: 'Filme atualizado com sucesso!',
				type: 'success',
			});

			// Revalidar a rota de listagem de filmes
			await revalidateMoviesList();

			router.push(`/movies/${params.id}`);
		} catch (err) {
			const errorMessage = (err as Error)?.message ?? "Erro ao salvar o filme.";
			showToast({
				message: errorMessage,
				type: 'error',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="card p-6 text-sm text-[--color-muted-foreground]">Carregando...</div>
		);
	}

	if (!movie) {
		return (
			<div className="card p-6 text-sm text-red-500">
				Filme não encontrado.
			</div>
		);
	}

	return (
		<div className="w-full px-4 py-8 sm:py-16">
			<div className="mx-auto max-w-2xl">
				<Card className="shadow-sm">
					<CardHeader className="space-y-0">
						<CardTitle className="text-xl font-semibold">Editar Filme</CardTitle>
						<CardDescription className="text-md">
							Atualize as informações do filme e salve as alterações.
						</CardDescription>
					</CardHeader>

					<form key={movie.id} onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">

							<div className="space-y-2">
								<Label htmlFor="title">Título</Label>
								<Input id="title" placeholder="Título" {...register("title")} error={!!errors.title} />
								<InputError error errorMessage={errors.title?.message} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="originalTitle">Título original</Label>
								<Input id="originalTitle" placeholder="Título original" {...register("originalTitle")} error={!!errors.originalTitle} />
								<InputError error={!!errors.originalTitle} errorMessage={errors.originalTitle?.message} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="overview">Sinopse</Label>
								<textarea
									id="overview"
									rows={4}
									placeholder="Sinopse"
									className="w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 outline-none"
									{...register("overview")}
								/>
								{errors.overview && (
									<span className="text-red-600 text-sm">{errors.overview.message}</span>
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
										{...register("releaseDate")}
									/>
									{errors.releaseDate && (
										<span className="text-red-600 text-sm">{errors.releaseDate.message}</span>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="runtime">Duração (min)</Label>
									<input
										id="runtime"
										type="number"
										placeholder="Duração (min)"
										className="rounded-md border border-[--color-border] bg-transparent px-3 py-2 outline-none"
										{...register("runtime")}
									/>
									{errors.runtime && (
										<span className="text-red-600 text-sm">{errors.runtime.message}</span>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="genres">Gêneros (vírgula)</Label>
									<Input id="genres" placeholder="ex.: ação, drama, comédia" {...register("genres")} error={!!errors.genres} />
									<InputError error={!!errors.genres} errorMessage={errors.genres?.message} />
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="posterUrl">Poster URL</Label>
								<Input id="posterUrl" placeholder="https://..." {...register("posterUrl")} error={!!errors.posterUrl} />
								<InputError error={!!errors.posterUrl} errorMessage={errors.posterUrl?.message} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="trailer">Trailer (YouTube URL)</Label>
								<Input id="trailer" placeholder="https://www.youtube.com/watch?v=..." {...register("trailer")} error={!!errors.trailer} />
								<InputError error={!!errors.trailer} errorMessage={errors.trailer?.message} />
							</div>
						</CardContent>

						<CardFooter className="flex justify-end">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Salvando..." : "Salvar"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}


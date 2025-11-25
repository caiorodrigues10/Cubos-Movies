'use client'

import { useState, useEffect } from 'react'
import { useQueryFilters, type FilterUpdates } from '@/hooks/useQueryFilters'
import { Input, InputContainer, InputLabel } from '@/components/ui/Input'
import { Select, SelectLabel } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { getGenres } from '@/services/genres'
import Image from 'next/image'

interface FilterQueryBuilderProps {
	onApply?: () => void
	onCancel?: () => void
}

export function FilterQueryBuilder({
	onApply,
	onCancel,
}: FilterQueryBuilderProps = {}) {
	const { push, searchParams } = useQueryFilters('/movies')

	const initialMinDuration = searchParams.get('durMin') ?? ''
	const initialMaxDuration = searchParams.get('durMax') ?? ''
	const initialStartDate = searchParams.get('dataInicio') ?? ''
	const initialEndDate = searchParams.get('dataFim') ?? ''
	const initialGenres = searchParams
		.getAll('genero')
		.map((g) => g.toLowerCase())

	const [minDuration, setMinDuration] = useState(initialMinDuration)
	const [maxDuration, setMaxDuration] = useState(initialMaxDuration)
	const [startDate, setStartDate] = useState(initialStartDate)
	const [endDate, setEndDate] = useState(initialEndDate)
	const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres)
	const [genres, setGenres] = useState<string[]>([])
	const [isLoadingGenres, setIsLoadingGenres] = useState(true)

	const hasActiveFilters =
		minDuration !== '' ||
		maxDuration !== '' ||
		startDate !== '' ||
		endDate !== '' ||
		selectedGenres.length > 0

	// Buscar gêneros da API
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
		const genre = e.target.value.toLowerCase()
		if (genre && !selectedGenres.includes(genre)) {
			setSelectedGenres([...selectedGenres, genre])
		}
		e.target.value = '' // Reset select
	}

	const handleRemoveGenre = (genreToRemove: string) => {
		setSelectedGenres(selectedGenres.filter((g) => g !== genreToRemove))
	}

	function apply() {
		const updates: FilterUpdates = {}
		updates['durMin'] = minDuration || null
		updates['durMax'] = maxDuration || null
		updates['dataInicio'] = startDate || null
		updates['dataFim'] = endDate || null
		updates['genero'] = selectedGenres.length > 0 ? selectedGenres : null
		push(updates, { resetPage: true })
		onApply?.()
	}

	function clearAll() {
		setMinDuration('')
		setMaxDuration('')
		setStartDate('')
		setEndDate('')
		setSelectedGenres([])
		push(
			{
				durMin: null,
				durMax: null,
				dataInicio: null,
				dataFim: null,
				genero: null,
			},
			{ resetPage: true },
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 pt-4">
				<InputContainer>
					<InputLabel>Duração Mínima (min)</InputLabel>
					<Input
						type="number"
						value={minDuration}
						onChange={(e) => setMinDuration(e.target.value)}
						placeholder="mín"
					/>
				</InputContainer>

				<InputContainer>
					<InputLabel>Duração Máxima (min)</InputLabel>
					<Input
						type="number"
						value={maxDuration}
						onChange={(e) => setMaxDuration(e.target.value)}
						placeholder="máx"
					/>
				</InputContainer>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<InputContainer>
					<InputLabel>Data Início</InputLabel>
					<Input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</InputContainer>

				<InputContainer>
					<InputLabel>Data Fim</InputLabel>
					<Input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</InputContainer>
			</div>

			<InputContainer>
				<SelectLabel htmlFor="genre-select-filter">Gêneros</SelectLabel>
				<Select
					id="genre-select-filter"
					onChange={handleAddGenre}
					defaultValue=""
					disabled={isLoadingGenres}
				>
					<option value="" disabled>
						{isLoadingGenres ? 'Carregando...' : 'Selecione um gênero'}
					</option>
					{genres.map((genre) => (
						<option
							key={genre}
							value={genre}
							disabled={selectedGenres.includes(genre.toLowerCase())}
						>
							{genre}
						</option>
					))}
				</Select>

				{selectedGenres.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-2">
						{selectedGenres.map((genre) => (
							<span
								key={genre}
								className="inline-flex items-center gap-1 rounded-full bg-[--color-primary] px-3 py-1 text-xs font-medium text-[--color-primary-foreground]"
							>
								{genre.charAt(0).toUpperCase() + genre.slice(1)}
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
				)}
			</InputContainer>

			<div className="flex justify-end gap-3 pt-4 border-t border-[--color-border]">
				{hasActiveFilters && (
					<Button type="button" variant="secondary" onClick={clearAll}>
						Limpar
					</Button>
				)}
				<Button type="button" variant="secondary" onClick={onCancel}>
					Cancelar
				</Button>
				<Button type="button" onClick={apply}>
					Filtrar
				</Button>
			</div>
		</div>
	)
}

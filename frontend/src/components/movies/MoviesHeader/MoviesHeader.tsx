'use client'

import { useState } from 'react'
import { SearchBar } from '../SearchBar/SearchBar'
import { FilterQueryBuilder } from '../FilterQueryBuilder'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Sidebar } from '@/components/ui/Sidebar'
import { CardContent } from '@/components/ui/Card'
import { AddMovieForm } from '../AddMovieForm/AddMovieForm'

export function MoviesHeader() {
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
	const [isAddMovieSidebarOpen, setIsAddMovieSidebarOpen] = useState(false)

	return (
		<>
			<div className="flex w-full flex-col items-end gap-3 ml-auto md:w-1/2 sm:flex-row sm:items-center">
				<div className="w-full flex-1">
					<SearchBar />
				</div>
				<div className="flex gap-3 w-full md:w-fit">
					<Button
						variant="secondary"
						className="max-sm:w-full"
						onClick={() => setIsFilterModalOpen(true)}
					>
						Filtros
					</Button>

					<Button
						className="max-sm:w-full"
						onClick={() => setIsAddMovieSidebarOpen(true)}
					>
						Adicionar Filme
					</Button>
				</div>
			</div>

			<Modal
				isOpen={isFilterModalOpen}
				onClose={() => setIsFilterModalOpen(false)}
				title="Filtros"
			>
				<CardContent>
					<FilterQueryBuilder
						onApply={() => setIsFilterModalOpen(false)}
						onCancel={() => setIsFilterModalOpen(false)}
					/>
				</CardContent>
			</Modal>

			<Sidebar
				isOpen={isAddMovieSidebarOpen}
				onClose={() => setIsAddMovieSidebarOpen(false)}
				title="Adicionar Filme"
			>
				<AddMovieForm onCancel={() => setIsAddMovieSidebarOpen(false)} />
			</Sidebar>
		</>
	)
}

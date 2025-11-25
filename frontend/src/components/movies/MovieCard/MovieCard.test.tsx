import { render, screen } from '@testing-library/react'
import { MovieCard } from './MovieCard'
import type { Movie } from '@/services/movies/types'
import { describe, it, expect } from 'vitest'

describe('MovieCard', () => {
	it('renders title and genres', () => {
		const movie: Movie = {
			id: '1',
			title: 'Inception',
			genres: ['sci-fi', 'thriller'],
		}

		render(<MovieCard movie={movie} />)

		expect(screen.getByText('Inception')).toBeInTheDocument()
		expect(screen.getByText('sci-fi, thriller')).toBeInTheDocument()
	})
})

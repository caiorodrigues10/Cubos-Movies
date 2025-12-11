import { prisma } from '../../../lib/prisma.js'

export interface IGenreRepository {
	listDistinctByOwner(ownerId: string): Promise<string[]>
}

export class GenreRepository implements IGenreRepository {
	async listDistinctByOwner(ownerId: string): Promise<string[]> {
		const rows = await prisma.movie.findMany({
			where: { ownerId, deletedAt: null },
			select: { genres: true },
			orderBy: { title: 'asc' },
		})

		const normalized = new Set<string>()
		for (const row of rows) {
			for (const g of row.genres ?? []) {
				const v = g.trim()
				if (v) normalized.add(v.toLowerCase())
			}
		}

		return Array.from(normalized).sort((a, b) =>
			a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
		)
	}
}

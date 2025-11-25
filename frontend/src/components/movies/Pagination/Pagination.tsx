import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useQueryFilters } from '@/hooks/useQueryFilters'

export function Pagination({
	page,
	total,
	perPage,
	basePath,
}: {
	page: number
	total: number
	perPage: number
	basePath: string // e.g. "/movies" or "/movies/dur-gte-90"
}) {
	const { push } = useQueryFilters(basePath)
	const totalPages = Math.max(1, Math.ceil(total / perPage))
	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
		Math.max(0, page - 3),
		Math.min(totalPages, page + 2),
	)

	function hrefFor(p: number) {
		const url = new URL(basePath, 'http://dummy.local')
		url.searchParams.set('page', String(p))
		return url.pathname + url.search
	}

	const isFirstPage = page <= 1
	const isLastPage = page >= totalPages

	return (
		<nav className="mt-6 flex items-center justify-center gap-2">
			<Button
				disabled={isFirstPage}
				onClick={() => push({ page: Math.max(1, page - 1) })}
			>
				<Image
					src="/images/Chevron Left.svg"
					alt="Página anterior"
					width={16}
					height={16}
					className="invert"
				/>
			</Button>
			{pageNumbers.map((n) => (
				<Button key={n} disabled={n === page} onClick={() => push({ page: n })}>
					{n}
				</Button>
			))}
			<Button
				disabled={isLastPage}
				onClick={() => push({ page: Math.min(totalPages, page + 1) })}
			>
				<Image
					src="/images/Chevron Right.svg"
					alt="Próxima página"
					width={16}
					height={16}
					className="invert"
				/>
			</Button>
		</nav>
	)
}

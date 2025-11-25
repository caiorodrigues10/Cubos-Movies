'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type FilterValue =
	| string
	| number
	| boolean
	| Array<string | number | boolean>
	| null
	| undefined
export type FilterUpdates = Record<string, FilterValue>

function applyUpdatesToParams(
	currentSearchParams: URLSearchParams,
	filterUpdates: FilterUpdates,
) {
	const nextSearchParams = new URLSearchParams(currentSearchParams.toString())
	for (const [key, filterValue] of Object.entries(filterUpdates)) {
		nextSearchParams.delete(key)
		if (filterValue === undefined || filterValue === null) continue
		const normalizedValues = Array.isArray(filterValue)
			? filterValue
			: [filterValue]
		for (const normalizedValue of normalizedValues) {
			const stringifiedValue =
				typeof normalizedValue === 'boolean'
					? String(normalizedValue)
					: String(normalizedValue)
			if (stringifiedValue.trim() === '') continue
			nextSearchParams.append(key, stringifiedValue)
		}
	}
	return nextSearchParams
}

export function useQueryFilters(basePath?: string) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	function push(
		filterUpdates: FilterUpdates,
		options?: { replace?: boolean; resetPage?: boolean },
	) {
		const currentSearchParams = new URLSearchParams(searchParams.toString())
		if (options?.resetPage) {
			currentSearchParams.delete('page')
		}
		const nextSearchParams = applyUpdatesToParams(
			currentSearchParams,
			filterUpdates,
		)
		const targetPath = basePath || pathname
		const targetUrl = `${targetPath}?${nextSearchParams.toString()}`
		if (options?.replace) router.replace(targetUrl)
		else router.push(targetUrl)
	}

	function remove(
		keysToRemove: string | string[],
		options?: { replace?: boolean; resetPage?: boolean },
	) {
		const currentSearchParams = new URLSearchParams(searchParams.toString())
		if (options?.resetPage) currentSearchParams.delete('page')
		for (const keyToRemove of Array.isArray(keysToRemove)
			? keysToRemove
			: [keysToRemove])
			currentSearchParams.delete(keyToRemove)
		const targetPath = basePath || pathname
		const queryString = currentSearchParams.toString()
		const targetUrl = queryString ? `${targetPath}?${queryString}` : targetPath
		if (options?.replace) router.replace(targetUrl)
		else router.push(targetUrl)
	}

	function getAll(key: string): string[] {
		return searchParams.getAll(key)
	}
	function get(key: string): string | null {
		return searchParams.get(key)
	}

	return {
		push,
		remove,
		get,
		getAll,
		searchParams,
		pathname,
	}
}

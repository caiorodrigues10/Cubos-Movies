'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateMoviesList() {
	revalidatePath('/movies')
}


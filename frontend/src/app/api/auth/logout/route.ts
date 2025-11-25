import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export async function GET() {
	const cookieStore = await cookies()
	cookieStore.delete(env.COOKIE_NAME)
	cookieStore.delete(env.COOKIE_USER_ID)
	return NextResponse.redirect(
		new URL('/login', process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
	)
}

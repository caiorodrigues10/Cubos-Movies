import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

async function handleProxy(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params
	const pathStr = path.join('/')
	const searchParams = request.nextUrl.searchParams.toString()
	const queryString = searchParams ? `?${searchParams}` : ''

	const backendUrl = env.BACKEND_URL
	const targetUrl = `${backendUrl}/${pathStr}${queryString}`

	const cookieStore = await cookies()
	const token = cookieStore.get(env.COOKIE_NAME)?.value

	const headers = new Headers(request.headers)
	headers.delete('host')
	headers.delete('connection')
	headers.delete('content-length')

	if (token) {
		headers.set('Authorization', `Bearer ${token}`)
	}

	try {
		const response = await fetch(targetUrl, {
			method: request.method,
			headers,
			body:
				request.method !== 'GET' && request.method !== 'HEAD'
					? request.body
					: undefined,
			// @ts-expect-error - duplex is required for streaming bodies in some environments
			duplex: 'half',
		})

		return new NextResponse(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		})
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json(
			{ message: 'Erro ao conectar com o servidor' },
			{ status: 500 },
		)
	}
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return handleProxy(request, context)
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return handleProxy(request, context)
}

export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return handleProxy(request, context)
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return handleProxy(request, context)
}

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return handleProxy(request, context)
}

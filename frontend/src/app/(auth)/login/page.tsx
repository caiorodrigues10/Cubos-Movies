import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	title: 'Login - Cubos Movies',
}

export default function LoginPage() {
	return <LoginForm />
}

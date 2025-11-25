import type { NextConfig } from 'next'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333'

const remotePatterns: Array<{
	protocol: 'http' | 'https'
	hostname: string
	port?: string
	pathname: string
}> = [
	{
		protocol: 'https',
		hostname: 'storage.googleapis.com',
		pathname: '/**',
	},
]

// Sempre adiciona configuração do proxy do backend (padrão)
try {
	const backendUrlObj = new URL(backendUrl)
	remotePatterns.push({
		protocol: backendUrlObj.protocol.replace(':', '') as 'http' | 'https',
		hostname: backendUrlObj.hostname,
		port: backendUrlObj.port || undefined,
		pathname: '/storage/proxy/**',
	})
} catch {
	// Fallback para localhost se não conseguir fazer parse
	remotePatterns.push({
		protocol: 'http',
		hostname: 'localhost',
		port: '3333',
		pathname: '/storage/proxy/**',
	})
}

const nextConfig: NextConfig = {
	images: {
		remotePatterns,
		unoptimized: false,
	},
}

export default nextConfig

import { Header } from '@/components/Header/Header'
import { BackgroundGradient } from '@/components/BackgroundGradient'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/Toaster'
import type { Metadata } from 'next'
import { Inter, Montserrat, Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	variable: '--font-roboto',
	subsets: ['latin'],
})

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

const montserrat = Montserrat({
	weight: ['400', '600'],
	variable: '--font-montserrat',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Cubos Movies',
	description: 'Gerencie seus filmes favoritos',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${roboto.variable} ${inter.variable} ${montserrat.variable} antialiased`}
			>
				<ThemeProvider>
					<div className="relative min-h-screen w-full flex flex-col">
						{/* Background image */}
						<div className="pointer-events-none fixed inset-0 z-0">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="/images/Background.png"
								alt=""
								className="h-full w-full -translate-y-[180px] opacity-40 object-cover"
							/>
						</div>

						{/* Gradient rectangle */}
						<BackgroundGradient />

						{/* Content above */}
						<div className="relative z-20 flex min-h-screen flex-col">
							<Header />
							<main className="flex-1 p-8">{children}</main>
							<Footer />
						</div>
					</div>
					<Toaster position="top-right" />
				</ThemeProvider>
			</body>
		</html>
	)
}

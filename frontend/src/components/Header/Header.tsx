'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function Header() {
	const pathname = usePathname()
	const isAuthenticated = pathname?.startsWith('/movies') || false

	return (
		<header className="sticky top-0 z-30 border-b border-[#F1E6FD30] bg-[#12111380]">
			<div className="container flex h-14 items-center justify-between gap-3">
				<Link href="/" className="flex items-center gap-2">
					<Image
						src="/images/Logo.png"
						alt="Cubos Movies"
						width={120}
						height={40}
						priority
						className="hidden h-auto w-auto md:block"
					/>
					<Image
						src="/images/ShortLogo.png"
						alt="Cubos Movies"
						width={35}
						height={35}
						priority
						className="h-auto w-auto md:hidden"
					/>
					<span
						className="text-xl font-bold"
						style={{ fontFamily: 'var(--font-inter), sans-serif' }}
					>
						Movies
					</span>
				</Link>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					{isAuthenticated && (
						<Link
							href="/api/auth/logout"
							prefetch={false}
							className="btn btn-primary"
						>
							<Button>Logout</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}

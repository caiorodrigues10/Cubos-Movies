'use client'

import { Toaster as SonnerToaster } from 'sonner'

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

export function Toaster(props: ToasterProps) {
	return (
		<SonnerToaster
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						'group toast group-[.toaster]:bg-[--color-card] group-[.toaster]:text-[--color-foreground] group-[.toaster]:border-[--color-border] group-[.toaster]:shadow-lg',
					description: 'group-[.toast]:text-[--color-muted-foreground]',
					actionButton:
						'group-[.toast]:bg-[--color-primary] group-[.toast]:text-[--color-primary-foreground]',
					cancelButton:
						'group-[.toast]:bg-[--color-muted] group-[.toast]:text-[--color-foreground]',
				},
			}}
			{...props}
		/>
	)
}

import { toast } from 'sonner'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
	message: string
	type?: ToastType
	duration?: number
	className?: string
}

export function showToast({
	message,
	type = 'info',
	duration = 4000,
	className,
}: ToastOptions) {
	const toastOptions = {
		duration,
		className,
	}

	switch (type) {
		case 'success':
			return toast.success(message, toastOptions)
		case 'error':
			return toast.error(message, toastOptions)
		case 'warning':
			return toast.warning(message, toastOptions)
		case 'info':
		default:
			return toast.info(message, toastOptions)
	}
}

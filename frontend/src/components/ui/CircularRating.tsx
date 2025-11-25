'use client'

import { motion } from 'framer-motion'

interface CircularRatingProps {
	rating: number // 0 to 10
	size?: number
	strokeWidth?: number
	color?: string
	trackColor?: string
}

export function CircularRating({
	rating,
	size = 60,
	strokeWidth = 6,
	color = '#FDE047', // amarelo (yellow-300 do tailwind ou similar)
	trackColor = '#FFFFFF40', // branco translúcido
}: CircularRatingProps) {
	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const percentage = Math.round(rating * 10)
	const strokeDashoffset = circumference - (percentage / 100) * circumference

	return (
		<div
			className="relative flex items-center justify-center font-bold text-white"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size} className="rotate-[-90deg]">
				{/* Track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="transparent"
					stroke={trackColor}
					strokeWidth={strokeWidth}
				/>
				{/* Progress */}
				<motion.circle
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset }}
					transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="transparent"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeLinecap="round"
				/>
			</svg>
			<div className="absolute text-sm drop-shadow-md">{percentage}%</div>
		</div>
	)
}

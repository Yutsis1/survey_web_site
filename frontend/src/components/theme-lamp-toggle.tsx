'use client'

import Image from 'next/image'
import { useTheme } from '@/app/contexts/theme-context'

export function LampToggle() {
    const { theme, toggleTheme } = useTheme()

    const lampIcon = theme === 'light' ? '/lamp-on.svg' : '/lamp-off.svg'
    const lampAlt = theme === 'light' ? 'Light theme lamp (on)' : 'Dark theme lamp (off)'

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md hover:bg-secondary/70 transition-colors p-2"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
            <Image
                src={lampIcon}
                alt={lampAlt}
                width={20}
                height={20}
                priority={false}
            />
        </button>
    )
}

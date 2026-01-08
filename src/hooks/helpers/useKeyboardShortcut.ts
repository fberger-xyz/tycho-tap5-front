import { useEffect } from 'react'

interface UseKeyboardShortcutProps {
    key: string
    onKeyPressed: () => void
    enabled?: boolean
}

export function useKeyboardShortcut({ key, onKeyPressed, enabled = true }: UseKeyboardShortcutProps) {
    useEffect(() => {
        if (!enabled) return

        function keyDownHandler(e: KeyboardEvent) {
            if (e.key === key) {
                e.preventDefault()
                onKeyPressed()
            }
        }

        document.addEventListener('keydown', keyDownHandler)
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
        }
    }, [key, onKeyPressed, enabled])
}
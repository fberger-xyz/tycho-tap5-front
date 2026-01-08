'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { useClickOutside } from '@/hooks/helpers/useClickOutside'
import { useKeyboardShortcut } from '@/hooks/helpers/useKeyboardShortcut'
import { useShowMobileDesign } from '@/hooks/helpers/useMediaQuery'
import { cn } from '@/utils/cn.util'

const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

const modalVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

const mobileModalVariants = {
    initial: { y: '100%', opacity: 1 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 1 },
}

const modalTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as const,
}

const mobileModalTransition = {
    type: 'spring' as const,
    damping: 40,
    stiffness: 500,
}

// inspired from https://fireship.io/lessons/framer-motion-modal/
export function Backdrop({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            className={cn(
                'fixed inset-0 z-[60] flex select-none items-end justify-center overflow-hidden backdrop-blur-sm md:items-center md:px-4',
                className,
            )}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    )
}

export function Modal({
    children,
    opened,
    onClose,
    className = 'p-6 md:p-8',
    showClose = true,
}: {
    children: React.ReactNode
    opened: boolean
    onClose: () => void
    className?: string
    showClose?: boolean
}) {
    const modalRef = useRef<HTMLDivElement>(null)
    const isMobile = useShowMobileDesign()

    // listen keyboard
    useKeyboardShortcut({ key: 'Escape', onKeyPressed: onClose, enabled: opened })
    useClickOutside(modalRef, onClose)

    useEffect(() => {
        if (opened) {
            // disable scroll + focus modal otherwise useKeyboardShortcut doesn't work
            document.body.style.overflow = 'hidden'
            modalRef.current?.focus({ preventScroll: true })
            return () => {
                document.body.style.overflow = ''
            }
        }
    }, [opened])

    // to refactor
    if (!opened) return null

    return (
        <AnimatePresence>
            {opened && (
                <Backdrop>
                    <motion.div
                        ref={modalRef}
                        tabIndex={-1}
                        drag={isMobile ? 'y' : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={(_, info) => {
                            if (!isMobile) return
                            const THRESHOLD = 150
                            const VELOCITY_THRESHOLD = 500
                            if (info.offset.y > THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD) onClose()
                        }}
                        variants={isMobile ? mobileModalVariants : modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={isMobile ? mobileModalTransition : modalTransition}
                        className={cn(
                            'relative z-50 max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-background/95 outline-none backdrop-blur-xl md:max-w-lg md:rounded-2xl md:border md:border-jagger/10',
                            className,
                        )}
                    >
                        {isMobile && (
                            <div className="absolute left-0 right-0 top-2 flex justify-center pb-1 hover:cursor-grab active:cursor-grabbing">
                                <div className="h-1 w-14 rounded-full bg-jagger-400/50" />
                            </div>
                        )}
                        {showClose && <ModalClose onClose={onClose} />}
                        {children}
                    </motion.div>
                </Backdrop>
            )}
        </AnimatePresence>
    )
}

export const DontShowAgainCheckbox = React.memo(function DontShowAgainCheckbox({
    checked,
    onChange,
    label = "Don't show again",
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
}) {
    return (
        <div className="justify-left group flex cursor-pointer select-none items-center">
            <Checkbox
                checked={checked}
                onCheckedChange={() => onChange(!checked)}
                className="flex-shrink-0 cursor-pointer border-jagger-400 bg-transparent text-milk-100"
            />
            <button onClick={() => onChange(!checked)} className="ml-2 cursor-pointer text-sm text-jagger-400 group-hover:text-milk-100">
                {label}
            </button>
        </div>
    )
})

export const ModalClose = React.memo(function ModalClose({ onClose }: { onClose: () => void }) {
    return (
        <button onClick={onClose} className="absolute right-0 top-0 z-50 cursor-pointer rounded-xl p-4 text-milk transition-colors">
            <X className="size-5" />
        </button>
    )
})

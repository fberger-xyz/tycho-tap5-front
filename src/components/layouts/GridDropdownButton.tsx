'use client'

import { useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import Image from 'next/image'
import { FileIds } from '@/enums'
import GridDropdown from './GridDropdown'

export default function GridDropdownButton() {
    const [openGridDropdown, setOpenGridDropdown] = useState(false)
    const gridDropdown = useRef<HTMLButtonElement>(null)
    useClickOutside(gridDropdown, () => setOpenGridDropdown(false))

    return (
        <button ref={gridDropdown} onClick={() => setOpenGridDropdown(!openGridDropdown)} className="relative">
            <div className="bg-milk-100 p-2.5 rounded-xl">
                <Image src={FileIds.GRID_DROPDOWN} alt={FileIds.GRID_DROPDOWN} width={16} height={16} className="min-w-4" />
            </div>
            <GridDropdown isOpen={openGridDropdown} onClose={() => setOpenGridDropdown(false)} />
        </button>
    )
}

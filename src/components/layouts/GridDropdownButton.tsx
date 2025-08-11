'use client'

import { useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/helpers/useClickOutside'
import Image from 'next/image'
import { FileIds } from '@/enums'
import GridDropdown from './GridDropdown'
import { ButtonDark } from '../figma/Button'

export default function GridDropdownButton() {
    const [openGridDropdown, setOpenGridDropdown] = useState(false)
    const gridDropdown = useRef<HTMLButtonElement>(null)
    useClickOutside(gridDropdown, () => setOpenGridDropdown(false))

    return (
        <ButtonDark ref={gridDropdown} onClick={() => setOpenGridDropdown(!openGridDropdown)} className="px-[9px] py-[9px] rounded-xl relative">
            <Image src={FileIds.GRID_DROPDOWN} alt={FileIds.GRID_DROPDOWN} width={16} height={16} className="min-w-4" />
            <GridDropdown isOpen={openGridDropdown} onClose={() => setOpenGridDropdown(false)} />
        </ButtonDark>
    )
}

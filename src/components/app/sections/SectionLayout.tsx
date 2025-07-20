import { ReactNode } from 'react'

export const SectionLayout = (props: { title: ReactNode; content: ReactNode }) => (
    <div className="flex flex-col w-full border rounded-xl px-4 py-3 border-milk-100 gap-2 bg-milk-50 backdrop-blur">
        {props.title}
        {props.content}
    </div>
)

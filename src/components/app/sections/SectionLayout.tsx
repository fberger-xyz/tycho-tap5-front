import { ReactNode } from 'react'

export const SectionLayout = (props: { title: ReactNode; content: ReactNode }) => (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-milk-100 bg-milk-50 px-4 py-3 backdrop-blur">
        {props.title}
        {props.content}
    </div>
)

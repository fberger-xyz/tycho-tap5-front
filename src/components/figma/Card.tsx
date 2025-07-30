export default function Card({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1 bg-milk-50 rounded-xl p-5">{children}</div>
}

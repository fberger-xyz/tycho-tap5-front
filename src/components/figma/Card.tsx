export default function Card({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1 bg-milk-50 rounded-xl p-5 hover:bg-milk-100 transition-colors duration-200">{children}</div>
}

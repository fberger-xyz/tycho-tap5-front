import PageWrapper from '@/components/common/PageWrapper'

// Changelog entry type
interface ChangelogEntry {
    date: string // ISO or YYYY/MM/DD
    description: string
    type?: 'feature' | 'fix' | 'chore' | 'docs' | 'refactor' | 'other'
    author?: string
    link?: string
}

// Fill this array with your logs
const logs: ChangelogEntry[] = [
    {
        date: '2025-06-06',
        description: 'Next 15 setup',
        type: 'chore',
        author: 'fberger',
    },
]

export default function Page() {
    return (
        <PageWrapper>
            <h1 className="text-2xl font-bold mb-4">Changelog</h1>
            {logs.length === 0 && <p className="opacity-60">No logs yet.</p>}
            {logs
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b pb-3 mb-3">
                        <div className="flex items-center gap-2 text-xs opacity-60">
                            <p>{log.date}</p>
                            {log.type && <p className="px-2 py-0.5 rounded text-[10px] uppercase">{log.type}</p>}
                            {log.author && <p>by {log.author}</p>}
                            {log.link && (
                                <a href={log.link} target="_blank" rel="noopener noreferrer" className="underline">
                                    details
                                </a>
                            )}
                        </div>
                        <div className="text-base">{log.description}</div>
                    </div>
                ))}
        </PageWrapper>
    )
}

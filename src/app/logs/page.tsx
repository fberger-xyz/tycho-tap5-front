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
        date: '2025-06-05',
        description: 'PWA setup (https://nextjs.org/docs/app/guides/progressive-web-apps)',
        type: 'chore',
        author: 'fberger',
    },
    {
        date: '2025-06-05',
        description: 'Next 15 setup',
        type: 'chore',
        author: 'fberger',
    },
]

export default function Page() {
    return (
        <PageWrapper>
            <div className="flex flex-col gap-4 mx-auto w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">Changelog</h1>
                {logs.length === 0 && <p className="opacity-60">No logs yet.</p>}
                {logs
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((log, i) => (
                        <div key={i} className="flex flex-col gap-1 border-b border-default/10 pb-3 mb-3">
                            <div className="flex items-center gap-2 text-xs opacity-60">
                                <span>{log.date}</span>
                                {log.type && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase">{log.type}</span>}
                                {log.author && <span>by {log.author}</span>}
                                {log.link && (
                                    <a href={log.link} target="_blank" rel="noopener noreferrer" className="underline text-primary">details</a>
                                )}
                            </div>
                            <div className="text-base">{log.description}</div>
                        </div>
                    ))}
            </div>
        </PageWrapper>
    )
}

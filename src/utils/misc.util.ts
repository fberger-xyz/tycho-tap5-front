export const copyToClipboard = async (value: string) => {
    try {
        await navigator.clipboard.writeText(value)
    } catch (error) {
        // Clipboard API might not be available
    }
}
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const uniquePredicate = (value: unknown, index: number, array: unknown[]) => array.indexOf(value) === index
export const isCurrentPath = (pathname: string, pagePath: string) => (pagePath === '/' ? pathname === pagePath : pathname.startsWith(pagePath))

export const isCurrentPath = (pathname: string, pagePath: string) => (pagePath === '/' ? pathname === pagePath : pathname.startsWith(pagePath))
export const uniquePredicate = (value: unknown, index: number, array: unknown[]) => array.indexOf(value) === index

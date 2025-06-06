export type StructuredOutput<T> = {
    success: boolean
    error: string
    data?: T
}

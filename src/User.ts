export interface User {
    readonly id: number
    readonly name: string
    readonly avatarUrl?: string
    readonly isConnected: boolean
    readonly isTyping: boolean
}
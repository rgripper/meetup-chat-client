import { User } from "./User"

export interface Message {
    readonly id: any
    readonly creationDate: Date
    readonly senderId: number
    readonly text: string
}
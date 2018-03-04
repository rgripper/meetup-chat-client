import { User } from "./User"
import { Message } from './Message'

export interface ChatData {
    readonly users: ReadonlyArray<User>
    readonly messages: ReadonlyArray<Message>
}
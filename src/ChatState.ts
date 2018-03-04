import { ChatData } from "./ChatData"
import { User } from "./User";
import { Message } from "./Message";

export interface ChatState {
    readonly users: ReadonlyArray<User>
    readonly messages: ReadonlyArray<Message>
}

export const ChatState = {
    Initial: {
        users: [],
        messages: []
    } as ChatState
}
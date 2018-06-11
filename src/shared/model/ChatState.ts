import { User } from "./User";
import { Message } from './Message';
import { currentId } from "async_hooks";

export interface ChatState {
    readonly users: ReadonlyArray<User>
    readonly messages: ReadonlyArray<Message>
}
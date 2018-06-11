import { ChatState } from "./ChatState";

export interface UserChatState extends ChatState {
    readonly currentUserId: number
}
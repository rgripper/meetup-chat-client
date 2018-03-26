import { ServerEventType, ServerEvent } from "./shared/ServerEvent";
import { Authenticatable } from "./ClientState";
import { ChatState } from "./shared/model/ChatState";

export type ChatStateReducer = (chatState: Authenticatable<ChatState>, event: ServerEvent) => Authenticatable<ChatState>

export const chatStateReducer: ChatStateReducer = (chatState: Authenticatable<ChatState>, event: ServerEvent): Authenticatable<ChatState> => {
    if (chatState.isAuthenticated) {
        switch (event.type) {
            case ServerEventType.MessageAdded:
                return {
                    ...chatState,
                    messages: [event.message, ...chatState.messages]
                };
            case ServerEventType.UserJoined:
                return {
                    ...chatState,
                    users: [event.user, ...chatState.users]
                };
            case ServerEventType.UserLeft:
                const disconnectedUser = chatState.users.find(x => x.id == event.userId);
                const otherUsers = chatState.users.filter(u => u.id !== event.userId);
                return {
                    ...chatState,
                    users: otherUsers.concat(disconnectedUser ? [{ ...disconnectedUser, isConnected: false }] : [])
                };
            default:
                console.log('event was not processed', event);
                return chatState;
        }
    }
    else {
        switch (event.type) {
            case ServerEventType.LoginFailed:
                return {
                    isAuthenticated: false,
                    error: event.error
                }
            case ServerEventType.LoginSuccessful:
                return {
                    ...event.chat,
                    isAuthenticated: true
                }
            default:
                console.log('event was not processed', event);
                return chatState;
        }
    }
}
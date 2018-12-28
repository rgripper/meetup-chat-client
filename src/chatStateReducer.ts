import { ServerEventType, ServerEvent } from "./shared/ServerEvent";
import { Authenticatable } from "./ClientState";
import { UserChatState } from "./shared/model/UserChatState";

export type ChatStateReducer = (chatState: Authenticatable<UserChatState>, event: ServerEvent) => Authenticatable<UserChatState>

export const chatStateReducer: ChatStateReducer = (chatState: Authenticatable<UserChatState>, event: ServerEvent): Authenticatable<UserChatState> => {
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
                    users: [event.user, ...chatState.users.filter(x => x.id !== event.user.id)]
                };
            case ServerEventType.UserLeft:
                const disconnectedUser = chatState.users.find(x => x.id == event.userId);
                const otherUsers = chatState.users.filter(u => u.id !== event.userId);
                return {
                    ...chatState,
                    users: otherUsers.concat(disconnectedUser ? [{ ...disconnectedUser, isAvailable: false }] : [])
                };
            default:
                console.log('event was not processed', event);
                return chatState;
        }
    }
    else {
        switch (event.type) {
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
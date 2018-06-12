"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerEvent_1 = require("./shared/ServerEvent");
exports.chatStateReducer = (chatState, event) => {
    if (chatState.isAuthenticated) {
        switch (event.type) {
            case ServerEvent_1.ServerEventType.MessageAdded:
                return Object.assign({}, chatState, { messages: [event.message, ...chatState.messages] });
            case ServerEvent_1.ServerEventType.UserJoined:
                return Object.assign({}, chatState, { users: [event.user, ...chatState.users.filter(x => x.id !== event.user.id)] });
            case ServerEvent_1.ServerEventType.UserLeft:
                const disconnectedUser = chatState.users.find(x => x.id == event.userId);
                const otherUsers = chatState.users.filter(u => u.id !== event.userId);
                return Object.assign({}, chatState, { users: otherUsers.concat(disconnectedUser ? [Object.assign({}, disconnectedUser, { isConnected: false })] : []) });
            default:
                console.log('event was not processed', event);
                return chatState;
        }
    }
    else {
        switch (event.type) {
            case ServerEvent_1.ServerEventType.LoginFailed:
                return {
                    isAuthenticated: false,
                    error: event.error
                };
            case ServerEvent_1.ServerEventType.LoginSuccessful:
                return Object.assign({}, event.chat, { isAuthenticated: true });
            default:
                console.log('event was not processed', event);
                return chatState;
        }
    }
};
//# sourceMappingURL=chatStateReducer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const SocketState_1 = require("./SocketState");
const BehaviorSubject_1 = require("rxjs/BehaviorSubject");
const WebSocketEventName_1 = require("./shared/transport/WebSocketEventName");
const ClientCommand_1 = require("./shared/ClientCommand");
const ServerEvent_1 = require("./shared/ServerEvent");
class ChatService {
    constructor(url) {
        this.stateChanges = new BehaviorSubject_1.BehaviorSubject(SocketState_1.SocketState.Initial);
        const socket = io(url, { transports: ['websocket'], autoConnect: false });
        socket.on('connect', () => console.log('connected'));
        socket.on('disconnect', () => console.log('disconnected'));
        this.socket = socket;
        this.wireEvents(socket, state => this.stateChanges.next(state));
        this.stateChanges.next({ isConnected: false, isConnecting: true });
        socket.open();
    }
    emitCommand(command) {
        this.socket.emit(WebSocketEventName_1.WebSocketEventName.ClientCommand, command);
    }
    join(userName) {
        this.emitCommand({ type: ClientCommand_1.ClientCommandType.TryLogin, userName });
    }
    leave() {
        this.emitCommand({ type: ClientCommand_1.ClientCommandType.Logout });
    }
    sendMessage(message) {
        this.emitCommand({ type: ClientCommand_1.ClientCommandType.AddMessage, message });
    }
    resetState() {
        this.emitCommand({ type: ClientCommand_1.ClientCommandType.ResetState });
    }
    disconnect() {
        this.socket.disconnect();
    }
    getNewChatState(chatState, event) {
        if (chatState.isAuthenticated) {
            switch (event.type) {
                case ServerEvent_1.ServerEventType.MessageAdded:
                    return Object.assign({}, chatState, { messages: [event.message, ...chatState.messages] });
                case ServerEvent_1.ServerEventType.UserJoined:
                    return Object.assign({}, chatState, { users: [event.user, ...chatState.users] });
                case ServerEvent_1.ServerEventType.UserLeft:
                    return Object.assign({}, chatState, { users: chatState.users.filter(u => u.id == event.userId) });
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
    }
    wireEvents(socket, emit) {
        socket.on('error', error => emit({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('connect_error', error => emit({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('reconnect_error', error => emit({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('connect', () => emit({ isConnected: true, isConnecting: false, chat: { isAuthenticated: false } }));
        socket.on('reconnecting', () => emit({ isConnected: false, isConnecting: true }));
        socket.on('disconnect', () => emit({ isConnected: false, isConnecting: false }));
        socket.on(WebSocketEventName_1.WebSocketEventName.ServerEvent, (event) => {
            console.log(event);
            if (this.stateChanges.value.isConnected) {
                emit(Object.assign({}, this.stateChanges.value, { chat: this.getNewChatState(this.stateChanges.value.chat, event) }));
            }
        });
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=ChatService.js.map
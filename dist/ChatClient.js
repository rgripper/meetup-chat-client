"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const SocketState_1 = require("./SocketState");
const rxjs_1 = require("rxjs");
const WebSocketEventName_1 = require("./shared/transport/WebSocketEventName");
const ClientCommand_1 = require("./shared/ClientCommand");
const chatStateReducer_1 = require("./chatStateReducer");
const ClientState_1 = require("./ClientState");
class ChatClient {
    constructor(url, chatStateReducer) {
        this.stateChanges = new rxjs_1.BehaviorSubject(ClientState_1.ClientState.Initial);
        this.tryLogin = (userName) => {
            this.emitCommand({ type: ClientCommand_1.ClientCommandType.TryLogin, userName });
        };
        this.logout = () => {
            this.emitCommand({ type: ClientCommand_1.ClientCommandType.Logout });
        };
        this.sendText = (text) => {
            this.emitCommand({ type: ClientCommand_1.ClientCommandType.AddMessage, message: { text } });
        };
        this.resetState = () => {
            this.emitCommand({ type: ClientCommand_1.ClientCommandType.ResetState });
        };
        this.connect = () => {
            this.stateChanges.next({
                socket: SocketState_1.SocketState.Connecting,
                chat: ClientState_1.AuthenticatableState.NotAuthenticated
            });
            this.socket.open();
        };
        this.disconnect = () => {
            this.socket.disconnect();
        };
        const socket = io(url, { transports: ["websocket"], autoConnect: false });
        socket.on("connect", () => console.log("connected"));
        socket.on("disconnect", () => console.log("disconnected"));
        this.socket = socket;
        this.wireEvents(socket, state => this.stateChanges.next(state), () => this.stateChanges.getValue(), chatStateReducer);
        this.socket.open();
    }
    emitCommand(command) {
        this.socket.emit(WebSocketEventName_1.WebSocketEventName.ClientCommand, command);
    }
    static connect(url) {
        return new ChatClient(url, chatStateReducer_1.chatStateReducer);
    }
    static subscribe(url, userName, handler) {
        const client = new ChatClient(url, chatStateReducer_1.chatStateReducer);
        const subscription = client.stateChanges.subscribe(handler);
        return {
            unsubscribe: () => subscription.unsubscribe(),
            sendText: client.sendText
        };
    }
    wireEvents(socket, emitState, getState, chatStateReducer) {
        const emitErrorState = (error) => emitState({
            chat: ClientState_1.AuthenticatableState.NotAuthenticated,
            socket: Object.assign({}, SocketState_1.SocketState.Disconnected, { error: error.toString() })
        });
        const emitLoggedOutState = () => emitState({
            socket: SocketState_1.SocketState.Connected,
            chat: ClientState_1.AuthenticatableState.NotAuthenticated
        });
        const emitPendingState = () => emitState({
            socket: SocketState_1.SocketState.Connecting,
            chat: ClientState_1.AuthenticatableState.NotAuthenticated
        });
        const emitDisconnectedState = () => emitState({
            socket: SocketState_1.SocketState.Disconnected,
            chat: ClientState_1.AuthenticatableState.NotAuthenticated
        });
        socket.on("error", emitErrorState);
        socket.on("connect_error", emitErrorState);
        socket.on("reconnect_error", emitErrorState);
        socket.on("connect", emitLoggedOutState);
        socket.on("reconnecting", emitPendingState);
        socket.on("disconnect", emitDisconnectedState);
        socket.on(WebSocketEventName_1.WebSocketEventName.ServerEvent, (event) => {
            const state = getState();
            console.log(event);
            if (!state.socket.isConnected)
                return;
            emitState({
                socket: SocketState_1.SocketState.Connected,
                chat: chatStateReducer(state.chat, event)
            });
        });
    }
}
exports.ChatClient = ChatClient;
//# sourceMappingURL=ChatClient.js.map
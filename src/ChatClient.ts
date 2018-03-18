import * as io from 'socket.io-client'
import { Message } from './shared/model/Message'
import { SubmittedMessage } from './shared/model/SubmittedMessage'
import { User } from './shared/model/User'
import { ChatState } from './shared/model/ChatState';
import { SocketState, ConnectedSocketState } from './SocketState';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { WebSocketEventName } from './shared/transport/WebSocketEventName';
import { ClientCommand, ClientCommandType } from './shared/ClientCommand';
import { ServerEvent, ServerEventType } from './shared/ServerEvent';
import { ChatStateReducer, chatStateReducer } from './chatStateReducer';
import { ClientState, EmptyState, Authenticatable } from './ClientState';

export class ChatClient {
    private socket: SocketIOClient.Socket;

    public stateChanges = new BehaviorSubject<ClientState>(ClientState.Initial);

    private emitCommand(command: ClientCommand) {
        this.socket.emit(WebSocketEventName.ClientCommand, command);
    }

    static connect(url: string): ChatClient {
        return new ChatClient(url, chatStateReducer);
    }

    constructor(url: string, chatStateReducer: ChatStateReducer) {
        const socket = io(url, { transports: ['websocket'], autoConnect: false });
        socket.on('connect', () => console.log('connected'));
        socket.on('disconnect', () => console.log('disconnected'));

        this.socket = socket;
        this.wireEvents(socket, state => this.stateChanges.next(state), () => this.stateChanges.getValue(), chatStateReducer);
    }

    join(userName: string): void {
        this.emitCommand({ type: ClientCommandType.TryLogin, userName });
    }

    leave(): void {
        this.emitCommand({ type: ClientCommandType.Logout });
    }

    sendMessage(message: SubmittedMessage): void {
        this.emitCommand({ type: ClientCommandType.AddMessage, message });
    }

    resetState(): void {
        this.emitCommand({ type: ClientCommandType.ResetState });
    }

    connect() {
        this.stateChanges.next({ socket: SocketState.Connecting, chat: EmptyState });
        this.socket.open();
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    private wireEvents(socket: SocketIOClient.Socket, emitState: (state: ClientState) => void, getState: () => ClientState, chatStateReducer: ChatStateReducer): void {
        const emitErrorState = (error: any) => emitState({
            chat: EmptyState,
            socket: { ...SocketState.Disconnected, error: error.toString() }
        });
        const emitLoggedOutState = () => emitState({
            socket: SocketState.Disconnected,
            chat: { isAuthenticated: false }
        });
        const emitPendingState = () => emitState({
            socket: SocketState.Connecting,
            chat: EmptyState
        });
        const emitDisconnectedState = () => emitState({
            socket: SocketState.Disconnected,
            chat: EmptyState
        });

        socket.on('error', emitErrorState);
        socket.on('connect_error', emitErrorState);
        socket.on('reconnect_error', emitErrorState);
        socket.on('connect', emitLoggedOutState);
        socket.on('reconnecting', emitPendingState);
        socket.on('disconnect', emitDisconnectedState);

        socket.on(WebSocketEventName.ServerEvent, (event: ServerEvent) => {
            const state = getState();
            console.log(event);

            if (!state.socket.isConnected) return;

            emitState({
                socket: SocketState.Connected,
                chat: chatStateReducer(state.chat as Authenticatable<ChatState>, event)
            });
        });
    }
}
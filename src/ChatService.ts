import * as io from 'socket.io-client'
import { Message } from './shared/model/Message'
import { SubmittedMessage } from './shared/model/SubmittedMessage'
import { User } from './shared/model/User'
import { ChatState } from './shared/model/ChatState';
import { SocketState, ConnectedSocketState, Authenticatable } from './SocketState';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { WebSocketEventName } from './shared/transport/WebSocketEventName';
import { ClientCommand, ClientCommandType } from './shared/ClientCommand';
import { ServerEvent, ServerEventType } from './shared/ServerEvent';


export class ChatService {
    private socket: SocketIOClient.Socket;

    public stateChanges = new BehaviorSubject(SocketState.Initial);

    private emitCommand(command: ClientCommand) {
        this.socket.emit(WebSocketEventName.ClientCommand, command);
    }

    constructor(url: string) {
        const socket = io(url, { transports: ['websocket'], autoConnect: false });
        socket.on('connect', () => console.log('connected'));
        socket.on('disconnect', () => console.log('disconnected'));

        this.socket = socket;
        this.wireEvents(socket, state => this.stateChanges.next(state));
        this.stateChanges.next({ isConnected: false, isConnecting: true });
        socket.open();
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

    disconnect(): void {
        this.socket.disconnect();
    }

    private getNewChatState(chatState: Authenticatable<ChatState>, event: ServerEvent): Authenticatable<ChatState> {
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
                    return {
                        ...chatState,
                        users: chatState.users.filter(u => u.id == event.userId)
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

    private wireEvents(socket: SocketIOClient.Socket, emit: (state: SocketState) => void): void {
        socket.on('error', error => emit({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('connect_error', error => emit({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('reconnect_error', error => emit({ isConnected: false, isConnecting: false, error: error.toString() }));

        socket.on('connect', () => emit({ isConnected: true, isConnecting: false, chat: { isAuthenticated: false } }));

        socket.on('reconnecting', () => emit({ isConnected: false, isConnecting: true }));

        socket.on('disconnect', () => emit({ isConnected: false, isConnecting: false }));

        socket.on(WebSocketEventName.ServerEvent, (event: ServerEvent) => {
            console.log(event);
            if (this.stateChanges.value.isConnected) {
                emit({
                    ...this.stateChanges.value,
                    chat: this.getNewChatState(this.stateChanges.value.chat, event)
                });
            }
        });
    }
}
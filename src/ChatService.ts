import * as io from 'socket.io-client'
import { Message } from './Message'
import { SubmittedMessage } from './SubmittedMessage'
import { User } from './User'
import { ChatData } from "./ChatData"
import { ChatState } from './ChatState';
import { SocketState, ConnectedSocketState } from './SocketState';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

type CustomServerEvent =
    | {
        type: 'MessageReceived',
        data: Message
    }
    | {
        type: 'UserJoined',
        data: User
    }
    | {
        type: 'UserLeft',
        data: { userId: number }
    }

export type JoinResult =
    | { isSuccessful: true, initialData: ChatData, user: User }
    | { isSuccessful: false, errorMessage: string }

export class ChatService {
    private socket: SocketIOClient.Socket;

    public stateChanges = new BehaviorSubject(SocketState.Initial);

    static connect(url: string): ChatService {
        const service = new ChatService();
        const socket = io(url, { transports: ['websocket'], autoConnect: false });
        service.socket = socket;
        socket.on('connect', () => console.log('conn'));
        socket.on('disconnected', () => console.log('disc'));

        service.wireEvents(socket);
        
        socket.open();
        return service;
    }

    join(userName: string): void {
        this.socket.emit('chat.client.join', userName);
    }

    leave(): void {
        this.socket.emit('chat.client.leave');
    }

    sendMessage(message: SubmittedMessage): void {
        this.socket.emit('chat.client.message', message);
    }

    private getNewChatState(chatState: ChatState | undefined, event: CustomServerEvent): ChatState {
        switch (event.type) {
            case 'MessageReceived':
                return {
                    ...chatState,
                    messages: [event.data, ...chatState.messages]
                };
            case 'UserJoined':
                return {
                    ...chatState,
                    users: [event.data, ...chatState.users]
                };
            case 'UserLeft':
                return {
                    ...chatState,
                    users: chatState.users.filter(u => u.id == event.data.userId)
                };
            default:
                return chatState;
        }
    }

    private  wireEvents(socket: SocketIOClient.Socket): void {
        socket.on('error', error => this.stateChanges.next({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('connect_error', error => this.stateChanges.next({ isConnected: false, isConnecting: false, error: error.toString() }));
        socket.on('reconnect_error', error => this.stateChanges.next({ isConnected: false, isConnecting: false, error: error.toString() }));
        
        socket.on('connect', () => this.stateChanges.next({ isConnected: true, isConnecting: false }));
        socket.on('reconnect', () => this.stateChanges.next({ isConnected: true, isConnecting: false }));

        socket.on('connecting', () => this.stateChanges.next({ isConnected: false, isConnecting: true }));
        socket.on('reconnecting', () => this.stateChanges.next({ isConnected: false, isConnecting: true }));

        socket.on('disconnect', () => this.stateChanges.next({ isConnected: false, isConnecting: false }));

        socket.on('chat.server.join-result', (result: JoinResult) => {
            console.debug('chat.server.join-result');
            if (result.isSuccessful === true) {
                this.stateChanges.next({
                    ...this.stateChanges.value,
                    chat: result.initialData
                });
            }
            else if (result.isSuccessful === false) {
                this.stateChanges.next({
                    isConnected: false,
                    isConnecting: false,
                    error: result.errorMessage,
                    chat: undefined
                });
            }
        });

        socket.on('chat.server.event', (event: CustomServerEvent) => {
            if (this.stateChanges.value.isConnected && this.stateChanges.value.chat != undefined) {
                this.stateChanges.next({
                    ...this.stateChanges.value,
                    chat: this.getNewChatState(this.stateChanges.value.chat, event)
                });
            }
        });
    }
}
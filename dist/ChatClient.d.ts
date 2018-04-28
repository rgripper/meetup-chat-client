import { SubmittedMessage } from './shared/model/SubmittedMessage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ChatStateReducer } from './chatStateReducer';
import { ClientState } from './ClientState';
export declare class ChatClient {
    private socket;
    stateChanges: BehaviorSubject<ClientState>;
    private emitCommand(command);
    static connect(url: string): ChatClient;
    constructor(url: string, chatStateReducer: ChatStateReducer);
    tryLogin(userName: string): void;
    logout(): void;
    sendMessage(message: SubmittedMessage): void;
    resetState(): void;
    connect(): void;
    disconnect(): void;
    private wireEvents(socket, emitState, getState, chatStateReducer);
}

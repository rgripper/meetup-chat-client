import { BehaviorSubject } from "rxjs";
import { ChatStateReducer } from "./chatStateReducer";
import { ClientState } from "./ClientState";
export declare class ChatClient {
    private socket;
    stateChanges: BehaviorSubject<ClientState>;
    private emitCommand;
    static connect(url: string): ChatClient;
    static subscribe(url: string, userName: string, handler: (data: ClientState) => any): {
        unsubscribe: () => void;
        sendText: (text: string) => void;
    };
    constructor(url: string, chatStateReducer: ChatStateReducer);
    tryLogin: (userName: string) => void;
    logout: () => void;
    sendText: (text: string) => void;
    connect: () => void;
    disconnect: () => void;
    private wireEvents;
}

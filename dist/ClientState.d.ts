import { ConnectedSocketState, ConnectingSocketState, DisconnectedSocketState } from "./SocketState";
import { UserChatState } from "./shared/model/UserChatState";
export declare type Authenticated = {
    isAuthenticated: true;
};
export declare type NotAuthenticated = {
    isAuthenticated: false;
    error?: string;
};
export declare const AuthenticatableState: {
    NotAuthenticated: NotAuthenticated;
};
export declare type Authenticatable<State> = (Authenticated & State) | NotAuthenticated;
export declare type ClientState = {
    socket: ConnectedSocketState;
    chat: Authenticatable<UserChatState>;
} | {
    socket: ConnectingSocketState | DisconnectedSocketState;
    chat: NotAuthenticated;
};
export declare const ClientState: {
    Initial: ClientState;
};

import { SocketState, ConnectedSocketState, ConnectingSocketState, DisconnectedSocketState } from "./SocketState";
import { UserChatState } from "./shared/model/UserChatState";

export type Authenticated = { isAuthenticated: true }
export type NotAuthenticated = { isAuthenticated: false, error?: string }
export const AuthenticatableState = {
    NotAuthenticated: { isAuthenticated: false } as NotAuthenticated
}

export type Authenticatable<State> =
| (Authenticated & State)
| NotAuthenticated

export type ClientState = 
| {
    socket: ConnectedSocketState
    chat: Authenticatable<UserChatState>
}
| {
    socket: ConnectingSocketState | DisconnectedSocketState
    chat: NotAuthenticated
}

export const ClientState = {
    Initial: {
        socket: SocketState.Disconnected,
        chat: AuthenticatableState.NotAuthenticated
    } as ClientState
}
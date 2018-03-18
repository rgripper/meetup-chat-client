import { SocketState, ConnectedSocketState, ConnectingSocketState, DisconnectedSocketState } from "./SocketState";
import { ChatState } from "./shared/model/ChatState";

export interface EmptyState {}
export const EmptyState = {}

export type Authenticatable<State> =
| {
    readonly isAuthenticated: true
} & State
| {
    readonly isAuthenticated: false
    readonly error?: string
}

export type ClientState = 
| {
    socket: ConnectedSocketState
    chat: Authenticatable<ChatState>
}
| {
    socket: ConnectingSocketState | DisconnectedSocketState
    chat: EmptyState
}

export const ClientState = {
    Initial: {
        socket: SocketState.Disconnected,
        chat: EmptyState
    }
}
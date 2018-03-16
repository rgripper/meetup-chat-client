import { ChatState } from "./shared/model/ChatState";

export type Authenticatable<State> =
| {
    readonly isAuthenticated: true
} & State
| {
    readonly isAuthenticated: false
    readonly error?: string
}

export interface ConnectedSocketState {
    isConnected: true
    isConnecting: false
    chat: Authenticatable<ChatState>
}

export interface PendingSocketState {
    isConnected: false
    isConnecting: true
}

export interface DisconnectedSocketState {
    isConnected: false
    isConnecting: false
    error?: string
}

export type SocketState = DisconnectedSocketState | PendingSocketState | ConnectedSocketState

export const SocketState = {
    Initial: { isConnected: false, isConnecting: false } as SocketState
}
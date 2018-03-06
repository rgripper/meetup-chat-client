import { ChatState } from "./ChatState";

export interface ConnectedSocketState {
    isConnected: true
    isConnecting: false
    chat?: ChatState
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
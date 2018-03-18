import { ChatState } from "./shared/model/ChatState";

export interface ConnectedSocketState {
    isConnected: true
    isConnecting: false
}

export interface ConnectingSocketState {
    isConnected: false
    isConnecting: true
}

export interface DisconnectedSocketState {
    isConnected: false
    isConnecting: false
    error?: string
}

export const SocketState = {
    Disconnected: { isConnected: false, isConnecting: false } as DisconnectedSocketState,
    Connecting: { isConnected: false, isConnecting: true } as ConnectingSocketState,
    Connected: { isConnected: true, isConnecting: false } as ConnectedSocketState
}
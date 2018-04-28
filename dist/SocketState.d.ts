export interface ConnectedSocketState {
    isConnected: true;
    isConnecting: false;
}
export interface ConnectingSocketState {
    isConnected: false;
    isConnecting: true;
}
export interface DisconnectedSocketState {
    isConnected: false;
    isConnecting: false;
    error?: string;
}
export declare const SocketState: {
    Disconnected: DisconnectedSocketState;
    Connecting: ConnectingSocketState;
    Connected: ConnectedSocketState;
};

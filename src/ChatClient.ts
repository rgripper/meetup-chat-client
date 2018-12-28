import * as io from "socket.io-client";
import { SocketState } from "./SocketState";
import { BehaviorSubject, Subscription } from "rxjs";
import { WebSocketEventName } from "./shared/transport/WebSocketEventName";
import { ClientCommand, ClientCommandType } from "./shared/ClientCommand";
import { ServerEvent } from "./shared/ServerEvent";
import { ChatStateReducer, chatStateReducer } from "./chatStateReducer";
import {
  ClientState,
  Authenticatable,
  AuthenticatableState
} from "./ClientState";
import { UserChatState } from "./shared/model/UserChatState";

export class ChatClient {
  private socket: SocketIOClient.Socket;

  public stateChanges = new BehaviorSubject<ClientState>(ClientState.Initial);

  private emitCommand(command: ClientCommand): void {
    this.socket.emit(WebSocketEventName.ClientCommand, command);
  }

  static connect(url: string): ChatClient {
    return new ChatClient(url, chatStateReducer);
  }

  static subscribe(url: string, userName: string, handler: (data: ClientState) => any): { unsubscribe: () => void, sendText: (text: string) => void } {
    const client = new ChatClient(url, chatStateReducer);
    const subscription = client.stateChanges.subscribe(handler);
    return {
      unsubscribe: () => subscription.unsubscribe(),
      sendText: client.sendText
    }
  }

  constructor(url: string, chatStateReducer: ChatStateReducer) {
    const socket = io(url, { transports: ["websocket"], autoConnect: false });
    socket.on("connect", () => console.log("connected"));
    socket.on("disconnect", () => console.log("disconnected"));

    this.socket = socket;
    this.wireEvents(
      socket,
      state => this.stateChanges.next(state),
      () => this.stateChanges.getValue(),
      chatStateReducer
    );
    this.socket.open();
  }

  tryLogin = (userName: string): void => {
    this.emitCommand({ type: ClientCommandType.TryLogin, userName });
  };

  logout = (): void => {
    this.emitCommand({ type: ClientCommandType.Logout });
  };

  sendText = (text: string): void => {
    this.emitCommand({ type: ClientCommandType.AddMessage, text });
  };

  connect = (): void => {
    this.stateChanges.next({
      socket: SocketState.Connecting,
      chat: AuthenticatableState.NotAuthenticated
    });
    this.socket.open();
  };

  disconnect = (): void => {
    this.socket.disconnect();
  };

  private wireEvents(
    socket: SocketIOClient.Socket,
    emitState: (state: ClientState) => void,
    getState: () => ClientState,
    chatStateReducer: ChatStateReducer
  ): void {
    const emitErrorState = (error: any) =>
      emitState({
        chat: AuthenticatableState.NotAuthenticated,
        socket: { ...SocketState.Disconnected, error: error.toString() }
      });
    const emitLoggedOutState = () =>
      emitState({
        socket: SocketState.Connected,
        chat: AuthenticatableState.NotAuthenticated
      });
    const emitPendingState = () =>
      emitState({
        socket: SocketState.Connecting,
        chat: AuthenticatableState.NotAuthenticated
      });
    const emitDisconnectedState = () =>
      emitState({
        socket: SocketState.Disconnected,
        chat: AuthenticatableState.NotAuthenticated
      });

    socket.on("error", emitErrorState);
    socket.on("connect_error", emitErrorState);
    socket.on("reconnect_error", emitErrorState);
    socket.on("connect", emitLoggedOutState);
    socket.on("reconnecting", emitPendingState);
    socket.on("disconnect", emitDisconnectedState);

    socket.on(WebSocketEventName.ServerEvent, (event: ServerEvent) => {
      const state = getState();
      console.log(event);

      if (!state.socket.isConnected) return;

      emitState({
        socket: SocketState.Connected,
        chat: chatStateReducer(
          state.chat as Authenticatable<UserChatState>,
          event
        )
      });
    });
  }
}

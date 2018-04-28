import { ServerEvent } from "./shared/ServerEvent";
import { Authenticatable } from "./ClientState";
import { ChatState } from "./shared/model/ChatState";
export declare type ChatStateReducer = (chatState: Authenticatable<ChatState>, event: ServerEvent) => Authenticatable<ChatState>;
export declare const chatStateReducer: ChatStateReducer;

import { ServerEvent } from "./shared/ServerEvent";
import { Authenticatable } from "./ClientState";
import { UserChatState } from "./shared/model/UserChatState";
export declare type ChatStateReducer = (chatState: Authenticatable<UserChatState>, event: ServerEvent) => Authenticatable<UserChatState>;
export declare const chatStateReducer: ChatStateReducer;

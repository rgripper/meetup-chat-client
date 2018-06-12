import { Message } from "./model/Message";
import { User } from "./model/User";
import { UserChatState } from "./model/UserChatState";
export declare enum ServerEventType {
    UserLeft = 0,
    UserJoined = 1,
    MessageAdded = 2,
    LoginSuccessful = 3,
    LoginFailed = 4
}
export declare type ServerEvent = {
    type: ServerEventType.MessageAdded;
    message: Message;
} | {
    type: ServerEventType.UserJoined;
    user: User;
} | {
    type: ServerEventType.UserLeft;
    userId: number;
} | {
    type: ServerEventType.LoginSuccessful;
    chat: UserChatState;
} | {
    type: ServerEventType.LoginFailed;
    error: string;
};

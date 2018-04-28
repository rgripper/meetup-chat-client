import { SubmittedMessage } from "./model/SubmittedMessage";
export declare enum ClientCommandType {
    Logout = 0,
    TryLogin = 1,
    AddMessage = 2,
    ResetState = 3,
}
export declare type ClientCommand = {
    type: ClientCommandType.TryLogin;
    userName: string;
} | {
    type: ClientCommandType.Logout;
} | {
    type: ClientCommandType.AddMessage;
    message: SubmittedMessage;
} | {
    type: ClientCommandType.ResetState;
};

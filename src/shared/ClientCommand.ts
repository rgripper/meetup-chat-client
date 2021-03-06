import { SubmittedMessage } from "./model/SubmittedMessage";

export enum ClientCommandType {
    Logout,
    TryLogin,
    AddMessage,
    ResetState
}

export type ClientCommand =
    | {
        type: ClientCommandType.TryLogin,
        userName: string
    }
    | {
        type: ClientCommandType.Logout
    }
    | {
        type: ClientCommandType.AddMessage,
        message: SubmittedMessage
    }
    | {
        type: ClientCommandType.ResetState,
    }
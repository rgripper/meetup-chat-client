"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketState_1 = require("./SocketState");
exports.AuthenticatableState = {
    NotAuthenticated: { isAuthenticated: false }
};
exports.ClientState = {
    Initial: {
        socket: SocketState_1.SocketState.Disconnected,
        chat: exports.AuthenticatableState.NotAuthenticated
    }
};
//# sourceMappingURL=ClientState.js.map
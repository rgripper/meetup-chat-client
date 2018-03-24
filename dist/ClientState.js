"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketState_1 = require("./SocketState");
exports.EmptyState = {};
exports.ClientState = {
    Initial: {
        socket: SocketState_1.SocketState.Disconnected,
        chat: exports.EmptyState
    }
};
//# sourceMappingURL=ClientState.js.map
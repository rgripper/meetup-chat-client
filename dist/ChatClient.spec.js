"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const operators_1 = require("rxjs/operators");
const index_1 = require("../src/index");
const serverUrl = "http://localhost:35558";
describe("ChatService", function () {
    this.timeout(15000);
    it("should connect", done => {
        const service = index_1.ChatClient.connect(serverUrl);
        service.stateChanges
            .pipe(operators_1.first(x => x.socket.isConnected && !x.chat.isAuthenticated))
            .subscribe(x => {
            console.log("test", JSON.stringify(x));
            service.resetState();
            service.disconnect();
            done();
        });
    });
    it("should join, send and receive a message", done => {
        const userName = "Giraffe";
        const messageText = "haha!";
        const service = index_1.ChatClient.connect(serverUrl);
        service.stateChanges
            .pipe(operators_1.filter((x) => x.socket.isConnected && x.chat.isAuthenticated), operators_1.bufferCount(2))
            .subscribe(states => {
            const containsUserName = states.some(x => x.chat.users.some(u => u.name === userName));
            const containsMessageText = states.some(x => x.chat.messages.some(u => u.text === messageText));
            chai_1.expect(containsUserName).to.be.true;
            chai_1.expect(containsMessageText).to.be.true;
            service.disconnect();
            done();
        });
        service.tryLogin(userName);
        service.sendText(messageText);
    });
});
//# sourceMappingURL=ChatClient.spec.js.map
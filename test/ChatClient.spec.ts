import { expect } from "chai";
import { first, filter, bufferCount } from "rxjs/operators";
import { ChatClient, UserChatState } from "../src/index";
import { ConnectedSocketState } from "../src/SocketState";
import { Authenticated } from "../src/ClientState";

const serverUrl = "http://localhost:35558";

describe("ChatService", function() {
  this.timeout(15000);

  it("should connect", done => {
    const service = ChatClient.connect(serverUrl);
    service.stateChanges
      .pipe(first(x => x.socket.isConnected && !x.chat.isAuthenticated))
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
    const service = ChatClient.connect(serverUrl);
    service.stateChanges
      .pipe(
        filter(
          (
            x
          ): x is {
            socket: ConnectedSocketState;
            chat: Authenticated & UserChatState;
          } => x.socket.isConnected && x.chat.isAuthenticated
        ),
        bufferCount(2)
      )
      .subscribe(states => {
        const containsUserName = states.some(x =>
          x.chat.users.some(u => u.name === userName)
        );
        const containsMessageText = states.some(x =>
          x.chat.messages.some(u => u.text === messageText)
        );

        expect(containsUserName).to.be.true;
        expect(containsMessageText).to.be.true;

        service.disconnect();
        done();
      });

    service.tryLogin(userName);
    service.sendMessage({ text: messageText });
  });
});

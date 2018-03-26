import { expect } from 'chai';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/bufferCount';
import { ChatClient } from '../src/index';
import { ChatState } from '../src/shared/model/ChatState';
import { ConnectedSocketState } from '../src/SocketState';
import { chatStateReducer } from '../src/chatStateReducer';
import { Authenticated } from '../src/ClientState';

const serverUrl = 'http://localhost:35558';

describe('ChatService', function () {
    this.timeout(15000);

    it('should connect', done => {
        const service = ChatClient.connect(serverUrl);
        service.stateChanges
            .first(x => x.socket.isConnected && !x.chat.isAuthenticated)
            .subscribe(x => {
                console.log('test', JSON.stringify(x))
                service.resetState();
                service.disconnect();
                done();
            });
    })

    it('should join, send and receive a message', (done) => {
        const userName = 'Giraffe';
        const messageText = 'haha!';
        const service = ChatClient.connect(serverUrl);
        service.stateChanges
            .filter((x): x is { socket: ConnectedSocketState, chat: Authenticated & ChatState } => x.socket.isConnected && x.chat.isAuthenticated)
            .bufferCount(2)
            .subscribe(states => {
                console.log(JSON.stringify(states))
                const containsUserName = states.some(x => x.chat.users.some(u => u.name === userName));
                const containsMessageText = states.some(x => x.chat.messages.some(u => u.text === messageText));

                expect(containsUserName).to.be.true;
                expect(containsMessageText).to.be.true;
                
                service.disconnect();
                done();
            });

        service.tryLogin(userName);
        service.sendMessage({ text: messageText });

    })
})
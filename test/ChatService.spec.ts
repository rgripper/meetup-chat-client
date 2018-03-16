import { expect } from 'chai';
import { ChatService } from '../src/index';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/bufferCount';
import { ChatState } from '../src/ChatState';
import { Observable } from 'rxjs/Observable';
import { ConnectedSocketState } from '../src/SocketState';

const serverUrl = 'http://localhost:35558'; //'https://serene-basin-84996.herokuapp.com/';

describe('ChatService', function () {
    this.timeout(15000);

    it('should connect', done => {
        const service = ChatService.connect(serverUrl);
        service.stateChanges
            .first(x => x.isConnected && x.chat == undefined)
            .subscribe(x => done());
    })

    it('should join, send and receive a message', (done) => {
        const service = ChatService.connect(serverUrl);
        const userName = 'Giraffe';
        const messageText = 'haha!';
        service.stateChanges
            .filter((x): x is ConnectedSocketState & { chat: ChatState } => x.isConnected && x.chat.isAuthenticated)
            .bufferCount(2)
            .subscribe(states => {
                expect(states.some(x => x.chat.users.some(u => u.name === userName))).to.be.true;
                expect(states.some(x => x.chat.messages.some(u => u.text === messageText))).to.be.true;
                done();
            });

        service.join(userName);
        service.sendMessage({ text: messageText });

    })
})
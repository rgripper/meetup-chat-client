import { expect } from 'chai';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/bufferCount';
import { ChatService } from '../src/index';
import { ChatState } from '../src/shared/model/ChatState';
import { ConnectedSocketState } from '../src/SocketState';

const serverUrl = 'http://localhost:35558'; //'https://serene-basin-84996.herokuapp.com/';

describe('ChatService', function () {
    this.timeout(15000);

    it('should connect', done => {
        const service = new ChatService(serverUrl);
        service.stateChanges
            .first(x => x.isConnected && !x.chat.isAuthenticated)
            .subscribe(x => {
                service.resetState();
                service.disconnect();
                done();
            });
    })

    it('should join, send and receive a message', (done) => {
        const userName = 'Giraffe';
        const messageText = 'haha!';
        const service = new ChatService(serverUrl);
        service.stateChanges
            .filter((x): x is ConnectedSocketState & { chat: ChatState } => x.isConnected && x.chat.isAuthenticated)
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

        service.join(userName);
        service.sendMessage({ text: messageText });

    })
})
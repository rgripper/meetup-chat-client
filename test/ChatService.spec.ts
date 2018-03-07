import { expect } from 'chai';
import { ChatService } from '../src/index';
import 'rxjs/add/operator/first'

describe('ChatService', () => {
    it('should connect', (done) => {
        const service = ChatService.connect('https://serene-basin-84996.herokuapp.com/');

        service.stateChanges.first(x => x.isConnected && x.chat == undefined).subscribe(x => {
            done();
        })
    })

    it('should join', (done) => {
        const service = ChatService.connect('https://serene-basin-84996.herokuapp.com/');

        service.stateChanges.first(x => x.isConnected && x.chat != undefined).subscribe(x => {

            if (x.isConnected && x.chat != undefined) {
                expect(x.chat.users.some(u => u.name == 'dummy')).to.be.true;
                done();
            }
        })

        service.join('dummy');
    })
})
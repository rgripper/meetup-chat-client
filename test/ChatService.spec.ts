import { expect } from 'chai';
import { ChatService } from '../src/index';

describe('ChatService', () => {
    it('should connect', (done) => {
        const service = ChatService.connect('https://serene-basin-84996.herokuapp.com/');

        service.stateChanges.subscribe(x => {
            if(x.isConnected) {
                done();
            }
        })
    })
})
import { expect } from 'chai';

import { ChatService } from '../src/index';

describe('ChatService', () => {
    it('should connect', (done) => {
        const service = new ChatService('https://serene-basin-84996.herokuapp.com/', {} as any);
        done();
    })
})
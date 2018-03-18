"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DummyChatService {
    constructor(handler) {
        this.handler = handler;
        this.dummyNames = ['Sam', 'Bill', 'RubberyJoe', 'Jenny', 'Cyclepath9'];
        this.initialChatState = { messages: [], users: [] };
        this.chatState = { messages: [], users: [] };
        this.lastMessageId = 0;
        this.setUpHandler(handler);
    }
    join(userName) {
        this.currentUser = { id: 1999, name: userName, isConnected: true, isTyping: false, avatarUrl: this.createAvatarUrl(userName) };
        this.chatState = Object.assign({}, this.initialChatState, { users: [this.currentUser] });
        this.handler.handleJoinResult({ isSuccessful: true, initialData: this.chatState, user: this.currentUser });
    }
    leave() {
        this.currentUser = undefined;
        this.chatState = this.initialChatState;
    }
    sendMessage(messageSubmission) {
        if (this.currentUser == undefined)
            throw new Error('Invalid state');
        this.lastMessageId++;
        const newMessage = Object.assign({}, messageSubmission, { id: this.lastMessageId, senderId: this.currentUser.id, creationDate: new Date() });
        this.handler.handleMessageReceived(newMessage);
    }
    createAvatarUrl(key) {
        return `https://robohash.org/${key}?size=128x128`;
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    setUpHandler(handler) {
        if (DummyChatService.intervalId) {
            return;
        }
        DummyChatService.intervalId = setInterval(() => {
            if (this.currentUser == undefined)
                return;
            const otherUsers = this.chatState.users.filter(x => x != this.currentUser);
            const prob = Math.random();
            if (prob > 0.6) {
                return;
            }
            else if (prob > 0.2) {
                if (otherUsers.length == 0)
                    return;
                const randomUser = otherUsers[this.getRandomInt(0, otherUsers.length)];
                this.lastMessageId++;
                const newMessage = { id: this.lastMessageId, senderId: randomUser.id, text: `Message ${this.lastMessageId} from ${randomUser.name}`, creationDate: new Date() };
                handler.handleMessageReceived(newMessage);
                return;
            }
            else if (prob > 0.05) {
                const name = this.getDummyUserName();
                const joiningUser = this.chatState.users.find(x => x.name == name)
                    || { id: Math.random(), isConnected: true, isTyping: false, name, avatarUrl: this.createAvatarUrl(name) };
                this.chatState = Object.assign({}, this.chatState, { users: this.chatState.users.filter(x => x.name != joiningUser.name).concat([Object.assign({}, joiningUser, { isConnected: false })]) });
                handler.handleUserJoined(joiningUser);
                return;
            }
            else {
                if (otherUsers.length == 0)
                    return;
                const leavingUser = otherUsers[this.getRandomInt(0, otherUsers.length)];
                this.chatState = Object.assign({}, this.chatState, { users: this.chatState.users.filter(x => x.name != leavingUser.name).concat([Object.assign({}, leavingUser, { isConnected: false })]) });
                handler.handleUserReft(leavingUser.id);
                return;
            }
        }, 1000);
    }
    getDummyUserName() {
        return this.dummyNames[this.getRandomInt(0, this.dummyNames.length)];
    }
}
exports.DummyChatService = DummyChatService;
//# sourceMappingURL=DummyChatService.js.map
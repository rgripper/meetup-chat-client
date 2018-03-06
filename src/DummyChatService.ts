import { User } from './User';
import { ChatState } from "./ChatState";
import { ChatDataHandler } from "./ChatService";
import { Message } from './Message';
import { SubmittedMessage } from './SubmittedMessage';

export class DummyChatService {

    private readonly dummyNames = ['Sam', 'Bill', 'RubberyJoe', 'Jenny', 'Cyclepath9'];

    private readonly initialChatState = { messages: [], users: [] };

    private chatState: ChatState = { messages: [], users: [] };

    private currentUser?: User;

    private lastMessageId = 0;

    private static intervalId: any;

    constructor(private handler: ChatDataHandler) {
        this.setUpHandler(handler);
    }

    join(userName: string) {
        this.currentUser = { id: 1999, name: userName, isConnected: true, isTyping: false, avatarUrl: this.createAvatarUrl(userName) };
        this.chatState = { ...this.initialChatState, users: [this.currentUser] };
        this.handler.handleJoinResult({ isSuccessful: true, initialData: this.chatState, user: this.currentUser });
    }

    leave() {
        this.currentUser = undefined;
        this.chatState = this.initialChatState;
    }

    sendMessage(messageSubmission: SubmittedMessage) {
        if (this.currentUser == undefined) throw new Error('Invalid state');
        this.lastMessageId++;
        const newMessage: Message = { ...messageSubmission, id: this.lastMessageId, senderId: this.currentUser.id, creationDate: new Date() };
        this.handler.handleMessageReceived(newMessage);
    }

    private createAvatarUrl(key: string) {
        return `https://robohash.org/${key}?size=128x128`;
    }

    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private setUpHandler(handler: ChatDataHandler) {
        if (DummyChatService.intervalId) {
            return;
        }
        DummyChatService.intervalId = setInterval(() => {
            if (this.currentUser == undefined) return;

            const otherUsers = this.chatState.users.filter(x => x != this.currentUser);
            const prob = Math.random();

            if (prob > 0.6) {
                return;
            }
            else if (prob > 0.2) {
                if (otherUsers.length == 0) return;
                const randomUser = otherUsers[this.getRandomInt(0, otherUsers.length)];
                this.lastMessageId++;
                const newMessage: Message = { id: this.lastMessageId, senderId: randomUser.id, text: `Message ${this.lastMessageId} from ${randomUser.name}`, creationDate: new Date() };
                handler.handleMessageReceived(newMessage);
                return;
            }
            else if (prob > 0.05) {
                const name = this.getDummyUserName();
                const joiningUser: User = this.chatState.users.find(x => x.name == name)
                    || { id: Math.random(), isConnected: true, isTyping: false, name, avatarUrl: this.createAvatarUrl(name) };
                this.chatState = { ...this.chatState, users: this.chatState.users.filter(x => x.name != joiningUser.name).concat([{ ...joiningUser, isConnected: false }]) };
                handler.handleUserJoined(joiningUser);
                return;
            }
            else {
                if (otherUsers.length == 0) return;
                const leavingUser = otherUsers[this.getRandomInt(0, otherUsers.length)];
                this.chatState = { ...this.chatState, users: this.chatState.users.filter(x => x.name != leavingUser.name).concat([{ ...leavingUser, isConnected: false }]) };
                handler.handleUserReft(leavingUser.id);
                return;
            }
        }, 1000);

    }

    private getDummyUserName(): string {
        return this.dummyNames[this.getRandomInt(0, this.dummyNames.length)];
    }
}
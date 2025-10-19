//todo conferir
export enum MessageStatus {
    SEND = 'SEND',
    RECEIVED = 'RECEIVED',
    READ = 'READ',
    FAILED = 'FAILED'
}

export enum MediaType {
    IMAGE = 'IMAGE',
    AUDIO = 'AUDIO',
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
}

export enum MessageType {
    USER = 'USER',
    CLIENT = 'CLIENT',
    BOT = 'BOT'
}

export type MediaMessage = {
    mediaType: MediaType;
    mediaUrl: string;
};
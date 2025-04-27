export type UniEventType = keyof UniEventBodyMap;
export interface UniEventBodyMap {
    POST_CREATED: {
        text: string;
    };
    PROFILE_MOVED: {
        newHome: string;
    };
}
export interface UniEvent<T extends UniEventType = UniEventType> {
    id: string;
    type: T;
    authorDid: string;
    createdAt: string;
    body: UniEventBodyMap[T];
    sig: string;
}
export interface UniEventProfileMoved {
    id: string;
    type: "PROFILE_MOVED";
    authorDid: string;
    newHome: string;
    createdAt: string;
    sig: string;
}
export declare function signEvent<T extends UniEventType>(event: Omit<UniEvent<T>, 'sig'>, privateKeyBase64: string): UniEvent<T>;
export declare function verifyEvent<T extends UniEventType>(event: UniEvent<T>, publicKeyBase64: string): boolean;

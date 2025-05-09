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
/**
 * Signs a federation event with the provided private key
 * @param event Event to sign (without sig field)
 * @param privateKeyBase64 Ed25519 private key in base64 format
 * @returns The event with signature added
 */
export declare function signEvent<T extends UniEventType>(event: Omit<UniEvent<T>, 'sig'>, privateKeyBase64: string): UniEvent<T>;
/**
 * Verifies the signature of a federation event
 * @param event Event to verify
 * @param publicKeyBase64 Ed25519 public key in base64 format
 * @returns True if signature is valid
 */
export declare function verifyEvent<T extends UniEventType>(event: UniEvent<T>, publicKeyBase64: string): boolean;

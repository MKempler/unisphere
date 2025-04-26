export interface UniEvent<T = unknown> {
    id: string;
    type: "POST_CREATED";
    authorDid: string;
    createdAt: string;
    body: T;
    sig: string;
}
/**
 * Signs a federation event with the provided private key
 * @param event Event to sign (without sig field)
 * @param privateKeyBase64 Ed25519 private key in base64 format
 * @returns The event with signature added
 */
export declare function signEvent<T>(event: Omit<UniEvent<T>, 'sig'>, privateKeyBase64: string): UniEvent<T>;
/**
 * Verifies the signature of a federation event
 * @param event Event to verify
 * @param publicKeyBase64 Ed25519 public key in base64 format
 * @returns True if signature is valid
 */
export declare function verifyEvent<T>(event: UniEvent<T>, publicKeyBase64: string): boolean;

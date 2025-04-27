import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

export type UniEventType = keyof UniEventBodyMap;

export interface UniEventBodyMap {
  POST_CREATED: { text: string };
  PROFILE_MOVED: { newHome: string };
}

export interface UniEvent<T extends UniEventType = UniEventType> {
  id: string;          // UUID v4
  type: T;
  authorDid: string;
  createdAt: string;   // ISO
  body: UniEventBodyMap[T];
  sig: string;         // Ed25519 signature (base64)
}

export interface UniEventProfileMoved {
  id: string;
  type: "PROFILE_MOVED";
  authorDid: string;    // old server
  newHome: string;      // base-url of new server
  createdAt: string;
  sig: string;
}

/**
 * Signs a federation event with the provided private key
 * @param event Event to sign (without sig field)
 * @param privateKeyBase64 Ed25519 private key in base64 format
 * @returns The event with signature added
 */
export function signEvent<T extends UniEventType>(
  event: Omit<UniEvent<T>, 'sig'>, 
  privateKeyBase64: string
): UniEvent<T> {
  try {
    // Decode the private key from base64
    const privateKey = naclUtil.decodeBase64(privateKeyBase64);
    
    // Create a normalized version of the event for signing (without sig field)
    const messageToSign = { ...event, sig: '' };
    
    // Convert to JSON string and then to Uint8Array
    const messageStr = JSON.stringify(messageToSign);
    const messageUint8 = naclUtil.decodeUTF8(messageStr);
    
    // Sign the message
    const signature = nacl.sign.detached(messageUint8, privateKey);
    
    // Encode the signature as base64
    const signatureBase64 = naclUtil.encodeBase64(signature);
    
    // Return the event with the signature added
    return {
      ...event,
      sig: signatureBase64,
    };
  } catch (error) {
    console.error('Failed to sign event:', error);
    // In a real implementation, we would handle this error properly
    // For now, return a placeholder signature
    return { ...event, sig: 'invalid-signature' } as UniEvent<T>;
  }
}

/**
 * Verifies the signature of a federation event
 * @param event Event to verify
 * @param publicKeyBase64 Ed25519 public key in base64 format
 * @returns True if signature is valid
 */
export function verifyEvent<T extends UniEventType>(event: UniEvent<T>, publicKeyBase64: string): boolean {
  try {
    // Decode the public key from base64
    const publicKey = naclUtil.decodeBase64(publicKeyBase64);
    
    // Extract signature and create a version of the event without it for verification
    const { sig, ...eventWithoutSig } = event;
    const normalizedEvent = { ...eventWithoutSig, sig: '' };
    
    // Convert to JSON string and then to Uint8Array
    const messageStr = JSON.stringify(normalizedEvent);
    const messageUint8 = naclUtil.decodeUTF8(messageStr);
    
    // Decode the signature from base64
    const signatureUint8 = naclUtil.decodeBase64(sig);
    
    // Verify the signature
    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKey);
  } catch (error) {
    console.error('Failed to verify event:', error);
    return false;
  }
} 
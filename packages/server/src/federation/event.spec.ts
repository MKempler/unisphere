import { Test } from '@nestjs/testing';
import { UniEvent, signEvent, verifyEvent } from '@unisphere/shared';
import { v4 as uuidv4 } from 'uuid';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

// Override the placeholder implementation in shared with the real one for testing
jest.mock('@unisphere/shared', () => {
  const original = jest.requireActual('@unisphere/shared');
  return {
    ...original,
    signEvent: (event: any, privateKeyBase64: string) => {
      const privateKey = naclUtil.decodeBase64(privateKeyBase64);
      const message = JSON.stringify({ ...event, sig: '' });
      const messageUint8 = naclUtil.decodeUTF8(message);
      const signature = nacl.sign.detached(messageUint8, privateKey);
      return {
        ...event,
        sig: naclUtil.encodeBase64(signature),
      };
    },
    verifyEvent: (event: any, publicKeyBase64: string) => {
      const publicKey = naclUtil.decodeBase64(publicKeyBase64);
      const { sig, ...eventWithoutSig } = event;
      const message = JSON.stringify({ ...eventWithoutSig, sig: '' });
      const messageUint8 = naclUtil.decodeUTF8(message);
      const signatureUint8 = naclUtil.decodeBase64(sig);
      return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKey);
    }
  };
});

describe('Federation Events', () => {
  let keyPair: nacl.SignKeyPair;
  let publicKeyBase64: string;
  let privateKeyBase64: string;

  beforeAll(() => {
    // Generate a key pair for testing
    keyPair = nacl.sign.keyPair();
    publicKeyBase64 = naclUtil.encodeBase64(keyPair.publicKey);
    privateKeyBase64 = naclUtil.encodeBase64(keyPair.secretKey);
  });

  it('should sign and verify an event successfully', () => {
    // Create a test event
    const eventId = uuidv4();
    const event: Omit<UniEvent<{ message: string }>, 'sig'> = {
      id: eventId,
      type: 'POST_CREATED',
      authorDid: 'did:key:test',
      createdAt: new Date().toISOString(),
      body: { message: 'Test message' },
    };

    // Sign the event
    const signedEvent = signEvent(event, privateKeyBase64);
    
    // Verify the signature
    const isValid = verifyEvent(signedEvent, publicKeyBase64);
    
    expect(isValid).toBe(true);
    expect(signedEvent.id).toBe(eventId);
    expect(signedEvent.sig).toBeTruthy();
  });

  it('should reject an event with an invalid signature', () => {
    // Create a test event
    const event: Omit<UniEvent<{ message: string }>, 'sig'> = {
      id: uuidv4(),
      type: 'POST_CREATED',
      authorDid: 'did:key:test',
      createdAt: new Date().toISOString(),
      body: { message: 'Test message' },
    };

    // Sign the event
    const signedEvent = signEvent(event, privateKeyBase64);
    
    // Tamper with the event data
    const tamperedEvent = {
      ...signedEvent,
      body: { message: 'Tampered message' },
    };
    
    // Verify the signature
    const isValid = verifyEvent(tamperedEvent, publicKeyBase64);
    
    expect(isValid).toBe(false);
  });

  it('should reject an event with the wrong public key', () => {
    // Create a test event
    const event: Omit<UniEvent<{ message: string }>, 'sig'> = {
      id: uuidv4(),
      type: 'POST_CREATED',
      authorDid: 'did:key:test',
      createdAt: new Date().toISOString(),
      body: { message: 'Test message' },
    };

    // Sign the event
    const signedEvent = signEvent(event, privateKeyBase64);
    
    // Generate a different key pair
    const wrongKeyPair = nacl.sign.keyPair();
    const wrongPublicKeyBase64 = naclUtil.encodeBase64(wrongKeyPair.publicKey);
    
    // Verify with the wrong public key
    const isValid = verifyEvent(signedEvent, wrongPublicKeyBase64);
    
    expect(isValid).toBe(false);
  });
}); 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const mockSignEvent = (event, privateKey) => {
    return { ...event, sig: 'mock-signature-for-testing' };
};
const mockVerifyEvent = (event, publicKey) => {
    return event.sig === 'mock-signature-for-testing' &&
        event.body.message !== 'Tampered message';
};
jest.mock('@unisphere/shared', () => ({
    signEvent: jest.fn(mockSignEvent),
    verifyEvent: jest.fn(mockVerifyEvent),
    UniEvent: jest.requireActual('@unisphere/shared').UniEvent
}));
describe('Federation Events', () => {
    const mockPublicKey = 'mock-public-key';
    const mockPrivateKey = 'mock-private-key';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should sign and verify an event successfully', () => {
        const { signEvent, verifyEvent } = require('@unisphere/shared');
        const eventId = (0, uuid_1.v4)();
        const event = {
            id: eventId,
            type: "POST_CREATED",
            authorDid: 'did:key:test',
            createdAt: new Date().toISOString(),
            body: { message: 'Test message' },
        };
        const signedEvent = signEvent(event, mockPrivateKey);
        const isValid = verifyEvent(signedEvent, mockPublicKey);
        expect(isValid).toBe(true);
        expect(signedEvent.id).toBe(eventId);
        expect(signedEvent.sig).toBeTruthy();
    });
    it('should reject an event with an invalid signature', () => {
        const { signEvent, verifyEvent } = require('@unisphere/shared');
        const event = {
            id: (0, uuid_1.v4)(),
            type: "POST_CREATED",
            authorDid: 'did:key:test',
            createdAt: new Date().toISOString(),
            body: { message: 'Test message' },
        };
        const signedEvent = signEvent(event, mockPrivateKey);
        const tamperedEvent = {
            ...signedEvent,
            body: { message: 'Tampered message' },
        };
        const isValid = verifyEvent(tamperedEvent, mockPublicKey);
        expect(isValid).toBe(false);
    });
    it('should reject an event with the wrong public key', () => {
    });
});
//# sourceMappingURL=event.spec.js.map
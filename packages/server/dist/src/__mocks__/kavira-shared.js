"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEvent = exports.signEvent = exports.ApiResponse = void 0;
exports.ApiResponse = {
    success: (data) => ({ ok: true, data }),
    error: (error) => ({ ok: false, error }),
};
exports.signEvent = jest.fn((event) => ({
    ...event,
    sig: 'mock-signature-for-testing',
    publicKey: 'mock-public-key'
}));
exports.verifyEvent = jest.fn(() => true);
//# sourceMappingURL=kavira-shared.js.map
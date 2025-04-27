"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signEvent = signEvent;
exports.verifyEvent = verifyEvent;
const nacl = __importStar(require("tweetnacl"));
const naclUtil = __importStar(require("tweetnacl-util"));
function signEvent(event, privateKeyBase64) {
    try {
        const privateKey = naclUtil.decodeBase64(privateKeyBase64);
        const messageToSign = { ...event, sig: '' };
        const messageStr = JSON.stringify(messageToSign);
        const messageUint8 = naclUtil.decodeUTF8(messageStr);
        const signature = nacl.sign.detached(messageUint8, privateKey);
        const signatureBase64 = naclUtil.encodeBase64(signature);
        return {
            ...event,
            sig: signatureBase64,
        };
    }
    catch (error) {
        console.error('Failed to sign event:', error);
        return { ...event, sig: 'invalid-signature' };
    }
}
function verifyEvent(event, publicKeyBase64) {
    try {
        const publicKey = naclUtil.decodeBase64(publicKeyBase64);
        const { sig, ...eventWithoutSig } = event;
        const normalizedEvent = { ...eventWithoutSig, sig: '' };
        const messageStr = JSON.stringify(normalizedEvent);
        const messageUint8 = naclUtil.decodeUTF8(messageStr);
        const signatureUint8 = naclUtil.decodeBase64(sig);
        return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKey);
    }
    catch (error) {
        console.error('Failed to verify event:', error);
        return false;
    }
}
//# sourceMappingURL=federation.js.map
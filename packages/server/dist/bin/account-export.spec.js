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
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const globals_1 = require("@jest/globals");
globals_1.jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findUnique: globals_1.jest.fn(),
        },
        $disconnect: globals_1.jest.fn(),
    };
    return { PrismaClient: globals_1.jest.fn(() => mockPrismaClient) };
});
globals_1.jest.mock('fs', () => ({
    writeFileSync: globals_1.jest.fn(),
}));
globals_1.jest.mock('readline', () => ({
    createInterface: globals_1.jest.fn(() => ({
        question: globals_1.jest.fn((question, callback) => callback('')),
        close: globals_1.jest.fn(),
    })),
}));
const account_export_1 = require("./account-export");
describe('account-export', () => {
    let prisma;
    beforeEach(() => {
        prisma = new client_1.PrismaClient();
        const mockUser = {
            id: 'user-id-1',
            handle: 'testuser',
            email: 'test@example.com',
            didPublicKey: 'did:key:test-public-key',
            didPrivateKeyEnc: 'encrypted-private-key',
            createdAt: new Date(),
            followers: [
                {
                    follower: {
                        id: 'follower-id-1',
                        handle: 'follower1',
                    },
                    createdAt: new Date(),
                }
            ]
        };
        prisma.user.findUnique.mockResolvedValue(mockUser);
    });
    afterEach(() => {
        globals_1.jest.clearAllMocks();
    });
    test('should export account data with all required fields', async () => {
        await (0, account_export_1.exportAccount)('test@example.com');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
            include: {
                followers: {
                    include: {
                        follower: true
                    }
                }
            }
        });
        expect(fs.writeFileSync).toHaveBeenCalled();
        const writeCall = fs.writeFileSync.mock.calls[0];
        const filename = writeCall[0];
        const jsonData = JSON.parse(writeCall[1]);
        expect(filename).toBe('testuser.json');
        expect(jsonData).toHaveProperty('id');
        expect(jsonData).toHaveProperty('handle');
        expect(jsonData).toHaveProperty('didPublicKey');
        expect(jsonData).toHaveProperty('didPrivateKeyEnc');
        expect(jsonData).toHaveProperty('followers');
        expect(Array.isArray(jsonData.followers)).toBe(true);
        if (jsonData.followers.length > 0) {
            const follower = jsonData.followers[0];
            expect(follower).toHaveProperty('followerHandle');
            expect(follower).toHaveProperty('followerId');
            expect(follower).toHaveProperty('createdAt');
        }
    });
});
describe.skip('account-export CLI', () => {
    it('needs to be rewritten', () => {
    });
});
//# sourceMappingURL=account-export.spec.js.map
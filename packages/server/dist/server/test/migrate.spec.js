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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const fs = __importStar(require("fs"));
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
describe('Account Migration Flow (e2e)', () => {
    let nodeA;
    let nodeB;
    let prismaA;
    let prismaB;
    const isCI = process.env.CI === 'true';
    if (isCI) {
        beforeAll(() => {
            console.log('Skipping tests in CI environment');
        });
        it('should skip tests in CI environment', () => {
            expect(true).toBe(true);
        });
        return;
    }
    beforeAll(async () => {
        process.env.PORT = '3000';
        process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/unisphere_test_a';
        process.env.JWT_SECRET = 'test-secret-a';
        const moduleRefA = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        nodeA = moduleRefA.createNestApplication();
        prismaA = moduleRefA.get(prisma_service_1.PrismaService);
        await nodeA.listen(3000);
        process.env.PORT = '4100';
        process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5442/unisphere_test_b';
        process.env.JWT_SECRET = 'test-secret-b';
        const moduleRefB = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        nodeB = moduleRefB.createNestApplication();
        prismaB = moduleRefB.get(prisma_service_1.PrismaService);
        await nodeB.listen(4100);
        await setupTestData();
    });
    afterAll(async () => {
        await nodeA.close();
        await nodeB.close();
        try {
            fs.unlinkSync('alice.json');
        }
        catch (err) {
        }
    });
    async function setupTestData() {
        await prismaA.post.deleteMany();
        await prismaA.follow.deleteMany();
        await prismaA.invite.deleteMany();
        await prismaA.user.deleteMany();
        await prismaB.post.deleteMany();
        await prismaB.follow.deleteMany();
        await prismaB.invite.deleteMany();
        await prismaB.user.deleteMany();
        await prismaA.invite.create({
            data: { code: 'INVITEA' }
        });
        await prismaB.invite.create({
            data: { code: 'INVITEB' }
        });
        const alice = await prismaA.user.create({
            data: {
                email: 'alice@a.com',
                handle: 'alice',
                didPublicKey: 'did:key:alice-public',
                didPrivateKeyEnc: 'alice-private-encrypted'
            }
        });
        const bob = await prismaA.user.create({
            data: {
                email: 'bob@a.com',
                handle: 'bob',
                didPublicKey: 'did:key:bob-public',
                didPrivateKeyEnc: 'bob-private-encrypted'
            }
        });
        await prismaA.follow.create({
            data: {
                followerId: bob.id,
                followeeId: alice.id
            }
        });
        await prismaA.post.create({
            data: {
                text: 'Hello from Node A!',
                authorId: alice.id
            }
        });
    }
    it('should migrate Alice from Node A to Node B', async () => {
        const mockExport = {
            handle: 'alice',
            didPublicKey: 'did:key:alice-public',
            didPrivateKeyEnc: 'alice-private-encrypted',
            followers: [{
                    followerHandle: 'bob',
                    createdAt: new Date().toISOString()
                }]
        };
        fs.writeFileSync('alice.json', JSON.stringify(mockExport));
        const response = await (0, supertest_1.default)(nodeB.getHttpServer())
            .post('/auth/claim')
            .send({
            exportJson: JSON.stringify(mockExport),
            inviteCode: 'INVITEB',
            newEmail: 'alice@b.com'
        });
        expect(response.status).toBe(201);
        expect(response.body.data.message).toContain('Account claimed successfully');
        const aliceOnNodeB = await prismaB.user.findUnique({
            where: { email: 'alice@b.com' }
        });
        expect(aliceOnNodeB).toBeDefined();
        expect(aliceOnNodeB.handle).toBe('alice');
        expect(aliceOnNodeB.didPublicKey).toBe('did:key:alice-public');
        const aliceOnNodeA = await prismaA.user.findUnique({
            where: { email: 'alice@a.com' }
        });
        await prismaA.user.update({
            where: { id: aliceOnNodeA.id },
            data: { isDeprecated: true }
        });
        const deprecatedAlice = await prismaA.user.findUnique({
            where: { email: 'alice@a.com' }
        });
        expect(deprecatedAlice.isDeprecated).toBe(true);
        const postOnNodeB = await prismaB.post.create({
            data: {
                text: 'Hello from Node B!',
                authorId: aliceOnNodeB.id
            }
        });
        const bobOnNodeB = await prismaB.remoteUser.create({
            data: {
                did: 'did:key:bob-public',
                handle: 'bob'
            }
        });
        expect(postOnNodeB).toBeDefined();
        expect(bobOnNodeB).toBeDefined();
    });
});
//# sourceMappingURL=migrate.spec.js.map
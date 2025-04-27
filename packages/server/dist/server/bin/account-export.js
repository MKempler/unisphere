#!/usr/bin/env ts-node
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
exports.exportAccount = exportAccount;
const fs = __importStar(require("fs"));
const client_1 = require("@prisma/client");
const dotenv_1 = require("dotenv");
const uuid_1 = require("uuid");
const readline = __importStar(require("readline"));
const shared_1 = require("@unisphere/shared");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
async function publishProfileMovedEvent(user, newHome, privateKeyEnc) {
    if (!privateKeyEnc) {
        console.error('Cannot publish event: Private key is null');
        return;
    }
    try {
        const event = {
            id: (0, uuid_1.v4)(),
            type: 'PROFILE_MOVED',
            authorDid: user.didPublicKey,
            createdAt: new Date().toISOString(),
            body: { newHome }
        };
        const signedEvent = (0, shared_1.signEvent)(event, privateKeyEnc);
        const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
        if (peers.length === 0) {
            console.warn('No peers configured for federation. Skipping event publication.');
            return;
        }
        console.log(`Publishing PROFILE_MOVED event to ${peers.length} peers...`);
        const publishPromises = peers.map(peer => axios_1.default.post(`${peer}/federation/event`, signedEvent)
            .then(() => console.log(`Event published to ${peer}`))
            .catch(err => console.error(`Failed to publish to ${peer}:`, err.message)));
        await Promise.all(publishPromises);
        console.log('Event publication completed.');
    }
    catch (error) {
        console.error('Error publishing PROFILE_MOVED event:', error);
    }
}
async function exportAccount(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                followers: {
                    include: {
                        follower: true
                    }
                }
            }
        });
        if (!user) {
            console.error(`No user found with email: ${email}`);
            process.exit(1);
        }
        const exportData = {
            id: user.id,
            handle: user.handle,
            didPublicKey: user.didPublicKey,
            didPrivateKeyEnc: user.didPrivateKeyEnc,
            followers: user.followers.map(follow => ({
                followerHandle: follow.follower.handle,
                followerId: follow.follower.id,
                createdAt: follow.createdAt.toISOString()
            }))
        };
        const filename = `${user.handle}.json`;
        fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
        console.log(`Account exported to ${filename}`);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the base URL of the new server (leave empty to skip): ', async (newHomeInput) => {
            rl.close();
            if (!newHomeInput || newHomeInput.trim() === '') {
                console.log('Skipping PROFILE_MOVED event publication.');
                await prisma.$disconnect();
                return;
            }
            await publishProfileMovedEvent(user, newHomeInput.trim(), user.didPrivateKeyEnc);
            await prisma.$disconnect();
        });
    }
    catch (error) {
        console.error('Error exporting account:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}
if (require.main === module) {
    (async () => {
        const email = process.argv[2];
        if (!email) {
            console.error('Usage: pnpm ts-node bin/account-export <email>');
            process.exit(1);
        }
        await exportAccount(email);
    })();
}
//# sourceMappingURL=account-export.js.map
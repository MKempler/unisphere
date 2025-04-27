#!/usr/bin/env node
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
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
dotenv.config();
async function main() {
    const peersEnv = process.env.PEERS;
    if (!peersEnv) {
        console.log(chalk_1.default.yellow('No peers configured. Set the PEERS environment variable.'));
        return;
    }
    const peers = peersEnv.split(',').map(p => p.trim()).filter(Boolean);
    if (peers.length === 0) {
        console.log(chalk_1.default.yellow('No valid peers found in the PEERS environment variable.'));
        return;
    }
    console.log(chalk_1.default.bold('\nChecking federation peers health:\n'));
    console.log(chalk_1.default.dim('─'.repeat(80)));
    console.log(chalk_1.default.bold('Peer'.padEnd(50)), chalk_1.default.bold('Status'.padEnd(10)), chalk_1.default.bold('Response Time'));
    console.log(chalk_1.default.dim('─'.repeat(80)));
    for (const peer of peers) {
        try {
            const startTime = Date.now();
            const url = `${peer}/federation/health`;
            const response = await axios_1.default.get(url, { timeout: 5000 });
            const duration = Date.now() - startTime;
            if (response.data?.ok) {
                console.log(peer.padEnd(50), chalk_1.default.green('OK'.padEnd(10)), `${duration}ms`);
            }
            else {
                console.log(peer.padEnd(50), chalk_1.default.red('ERROR'.padEnd(10)), `${duration}ms - Unexpected response`);
            }
        }
        catch (error) {
            console.log(peer.padEnd(50), chalk_1.default.red('ERROR'.padEnd(10)), error.code || error.message || 'Unknown error');
        }
    }
    console.log(chalk_1.default.dim('─'.repeat(80)));
}
main().catch(error => {
    console.error('Error checking peer health:', error);
    process.exit(1);
});
//# sourceMappingURL=peer-health.js.map
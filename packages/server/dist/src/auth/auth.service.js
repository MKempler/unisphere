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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const mailer_service_1 = require("../common/mailer.service");
const crypto_1 = require("../common/crypto");
const api_response_1 = require("../common/api-response");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailerService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.magicLinkTokens = {};
    }
    async signup(dto) {
        return { ok: true, data: "Success" };
    }
    async confirmMagicLink(token) {
        return { success: true };
    }
    async claimUserHandle(token, handle) {
        return { ok: true, data: handle };
    }
    async sendPasswordResetLink(email) {
        return { success: true };
    }
    async verifyCallbackToken(token, inviteCode) {
        const storedToken = this.magicLinkTokens[token];
        if (!storedToken) {
            return api_response_1.ApiResponse.error('Invalid or expired token');
        }
        if (new Date() > storedToken.expires) {
            delete this.magicLinkTokens[token];
            return api_response_1.ApiResponse.error('Token has expired');
        }
        const { email } = storedToken;
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            if (process.env.REQUIRE_INVITE === 'true' && !inviteCode) {
                return api_response_1.ApiResponse.error('Invite code required for new user registration');
            }
            if (inviteCode) {
                const invite = await this.prisma.invite.findUnique({
                    where: { code: inviteCode },
                });
                if (!invite) {
                    return api_response_1.ApiResponse.error('Invalid invite code');
                }
                if (invite.usedById) {
                    return api_response_1.ApiResponse.error('Invite code has already been used');
                }
            }
            const baseHandle = email.split('@')[0].toLowerCase();
            const didKeyPair = this.generateDidKeyPair();
            try {
                user = await this.prisma.user.create({
                    data: {
                        email,
                        handle: baseHandle,
                        didPublicKey: didKeyPair.publicKey,
                        didPrivateKeyEnc: didKeyPair.privateKeyEnc,
                    },
                });
                if (inviteCode) {
                    await this.prisma.invite.update({
                        where: { code: inviteCode },
                        data: { usedById: user.id },
                    });
                }
            }
            catch (error) {
                const randomSuffix = Math.floor(Math.random() * 10000);
                user = await this.prisma.user.create({
                    data: {
                        email,
                        handle: `${baseHandle}${randomSuffix}`,
                        didPublicKey: didKeyPair.publicKey,
                        didPrivateKeyEnc: didKeyPair.privateKeyEnc,
                    },
                });
                if (inviteCode) {
                    await this.prisma.invite.update({
                        where: { code: inviteCode },
                        data: { usedById: user.id },
                    });
                }
            }
        }
        delete this.magicLinkTokens[token];
        const payload = {
            sub: user.id,
            email: user.email,
            handle: user.handle,
        };
        const jwt = this.jwtService.sign(payload);
        return api_response_1.ApiResponse.success({
            token: jwt,
            user: {
                id: user.id,
                email: user.email,
                handle: user.handle,
            },
        });
    }
    generateDidKeyPair() {
        const publicKey = `did:key:${crypto.randomBytes(16).toString('hex')}`;
        const privateKey = crypto.randomBytes(32).toString('hex');
        const privateKeyEnc = (0, crypto_1.encrypt)(privateKey);
        return {
            publicKey,
            privateKeyEnc,
        };
    }
    async claimAccount(exportJsonStr, inviteCode, newEmail) {
        const invite = await this.prisma.invite.findUnique({
            where: { code: inviteCode },
        });
        if (!invite) {
            return api_response_1.ApiResponse.error('Invalid invite code');
        }
        if (invite.usedById) {
            return api_response_1.ApiResponse.error('Invite code has already been used');
        }
        let exportData;
        try {
            exportData = JSON.parse(exportJsonStr);
        }
        catch (error) {
            return api_response_1.ApiResponse.error('Invalid export data format');
        }
        if (!exportData.handle || !exportData.didPublicKey || !exportData.didPrivateKeyEnc) {
            return api_response_1.ApiResponse.error('Export data is missing required fields');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { handle: exportData.handle },
        });
        if (existingUser) {
            return api_response_1.ApiResponse.error('Handle is already taken on this server');
        }
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: newEmail,
                    handle: exportData.handle,
                    didPublicKey: exportData.didPublicKey,
                    didPrivateKeyEnc: exportData.didPrivateKeyEnc,
                },
            });
            await this.prisma.invite.update({
                where: { code: inviteCode },
                data: { usedById: user.id },
            });
            if (exportData.followers && Array.isArray(exportData.followers)) {
                for (const follower of exportData.followers) {
                    let remoteUser = await this.prisma.remoteUser.findFirst({
                        where: { handle: follower.followerHandle }
                    });
                    if (!remoteUser) {
                        remoteUser = await this.prisma.remoteUser.create({
                            data: {
                                handle: follower.followerHandle,
                                did: `placeholder-did-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
                            }
                        });
                    }
                }
            }
            return await this.signup({ email: newEmail });
        }
        catch (error) {
            console.error('Failed to claim account:', error);
            return api_response_1.ApiResponse.error('Failed to claim account');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mailer_service_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
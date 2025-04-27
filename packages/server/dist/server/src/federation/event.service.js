"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EventService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const peer_service_1 = require("./peer.service");
const shared_1 = require("@unisphere/shared");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
let EventService = EventService_1 = class EventService {
    constructor(prisma, peerService) {
        this.prisma = prisma;
        this.peerService = peerService;
        this.logger = new common_1.Logger(EventService_1.name);
        this.federationTimeoutMs = parseInt(process.env.FEDERATION_TIMEOUT_MS || '5000', 10);
    }
    async publish(event) {
        const peers = this.peerService.getPeers();
        if (peers.length === 0) {
            this.logger.log('No peers configured, skipping federation');
            return;
        }
        this.logger.log(`Publishing event ${event.id} to ${peers.length} peers`);
        const publishPromises = peers.map(async (peer) => {
            const url = `${peer}/federation/event`;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), this.federationTimeoutMs);
                await axios_1.default.post(url, event, {
                    signal: controller.signal,
                    headers: { 'Content-Type': 'application/json' },
                });
                clearTimeout(timeout);
                this.logger.log(`Successfully published to ${peer}`);
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
                    this.logger.warn(`Publish to ${peer} timed out after ${this.federationTimeoutMs}ms`);
                }
                else {
                    this.logger.error(`Failed to publish to ${peer}: ${error.message}`);
                }
            }
        });
        await Promise.allSettled(publishPromises);
    }
    async publishProfileMoved(userDid, newHome, privateKeyEnc) {
        const event = {
            id: (0, uuid_1.v4)(),
            type: 'PROFILE_MOVED',
            authorDid: userDid,
            createdAt: new Date().toISOString(),
            body: { newHome }
        };
        const signedEvent = (0, shared_1.signEvent)(event, privateKeyEnc);
        await this.publish(signedEvent);
    }
    async receive(event) {
        this.logger.log(`Received event ${event.id} of type ${event.type}`);
        if (event.type === 'POST_CREATED') {
            await this.handlePostCreatedEvent(event);
        }
        else if (event.type === 'PROFILE_MOVED') {
            await this.handleProfileMovedEvent(event);
        }
        else {
            this.logger.warn(`Unsupported event type: ${event.type}`);
        }
    }
    async handlePostCreatedEvent(event) {
        const { authorDid, body: post } = event;
        const existingPost = await this.prisma.post.findUnique({
            where: { federationId: event.id },
        });
        if (existingPost) {
            this.logger.log(`Post ${event.id} already exists, skipping`);
            return;
        }
        let remoteUser = await this.prisma.remoteUser.findUnique({
            where: { did: authorDid },
        });
        if (!remoteUser) {
            this.logger.log(`Creating new remote user with DID ${authorDid}`);
            remoteUser = await this.prisma.remoteUser.create({
                data: {
                    did: authorDid,
                    handle: post.author.handle,
                },
            });
        }
        await this.prisma.post.create({
            data: {
                id: post.id,
                text: post.text,
                createdAt: new Date(post.createdAt),
                remoteAuthorId: remoteUser.id,
                federationId: event.id,
            },
        });
        this.logger.log(`Successfully created federated post ${post.id}`);
    }
    async handleProfileMovedEvent(event) {
        const { authorDid, body } = event;
        const { newHome } = body;
        this.logger.log(`Processing PROFILE_MOVED event for ${authorDid} to ${newHome}`);
        try {
            const localUser = await this.prisma.user.findFirst({
                where: { didPublicKey: authorDid }
            });
            if (localUser) {
                await this.prisma.user.update({
                    where: { id: localUser.id },
                    data: { isDeprecated: true }
                });
                this.logger.log(`Marked local user ${localUser.handle} as deprecated`);
                const followers = await this.prisma.follow.findMany({
                    where: { followeeId: localUser.id },
                    include: { follower: true }
                });
                for (const follow of followers) {
                    this.logger.log(`User ${follow.follower.handle} was following ${localUser.handle}. Adding remote follow record.`);
                    let remoteUser = await this.prisma.remoteUser.findFirst({
                        where: { did: authorDid }
                    });
                    if (!remoteUser) {
                        remoteUser = await this.prisma.remoteUser.create({
                            data: {
                                did: authorDid,
                                handle: localUser.handle,
                                homeUrl: newHome
                            }
                        });
                    }
                    else {
                        remoteUser = await this.prisma.remoteUser.update({
                            where: { id: remoteUser.id },
                            data: { homeUrl: newHome }
                        });
                    }
                }
            }
            else {
                const remoteUser = await this.prisma.remoteUser.findFirst({
                    where: { did: authorDid }
                });
                if (remoteUser) {
                    await this.prisma.remoteUser.update({
                        where: { id: remoteUser.id },
                        data: { homeUrl: newHome }
                    });
                    this.logger.log(`Updated remote user ${remoteUser.handle} with new home URL: ${newHome}`);
                }
                else {
                    this.logger.warn(`No user found with DID ${authorDid}, cannot process PROFILE_MOVED event`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error processing PROFILE_MOVED event: ${error.message}`);
        }
    }
};
exports.EventService = EventService;
exports.EventService = EventService = EventService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        peer_service_1.PeerService])
], EventService);
//# sourceMappingURL=event.service.js.map
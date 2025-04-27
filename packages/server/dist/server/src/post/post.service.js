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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const api_response_1 = require("../common/api-response");
const event_service_1 = require("../federation/event.service");
const uuid_1 = require("uuid");
let PostService = class PostService {
    constructor(prisma, eventService) {
        this.prisma = prisma;
        this.eventService = eventService;
    }
    async createPost(userId, text, mediaUrl) {
        try {
            const hashtagNames = this.extractHashtags(text);
            const post = await this.prisma.$transaction(async (tx) => {
                const newPost = await tx.post.create({
                    data: {
                        text,
                        authorId: userId,
                        mediaUrl,
                        federationId: (0, uuid_1.v4)(),
                        indexed: true,
                    },
                });
                for (const name of hashtagNames) {
                    const hashtag = await tx.hashtag.upsert({
                        where: { name },
                        create: { name },
                        update: {},
                    });
                    await tx.hashtagsOnPosts.create({
                        data: {
                            postId: newPost.id,
                            hashtagId: hashtag.id,
                        },
                    });
                }
                return await tx.post.findUnique({
                    where: { id: newPost.id },
                    include: {
                        author: true,
                        hashtags: {
                            include: {
                                hashtag: true,
                            },
                        },
                    },
                });
            });
            if (!post) {
                return api_response_1.ApiResponse.error('Failed to create post');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (user && user.didPublicKey) {
                this.eventService.publish({
                    id: (0, uuid_1.v4)(),
                    type: 'POST_CREATED',
                    authorDid: user.didPublicKey,
                    createdAt: new Date().toISOString(),
                    body: {
                        id: post.id,
                        text: post.text,
                        mediaUrl: post.mediaUrl,
                    },
                    sig: '',
                });
            }
            return api_response_1.ApiResponse.success({
                id: post.id,
                text: post.text,
                createdAt: post.createdAt.toISOString(),
                author: {
                    id: post.author.id,
                    handle: post.author.handle,
                },
                hashtags: post.hashtags.map(h => h.hashtag.name),
                mediaUrl: post.mediaUrl,
            });
        }
        catch (error) {
            return api_response_1.ApiResponse.error('Failed to create post');
        }
    }
    extractHashtags(text) {
        if (!text)
            return [];
        const hashtagPattern = /#(\w+)/g;
        const matches = text.match(hashtagPattern);
        if (!matches)
            return [];
        return matches.map(tag => tag.substring(1).toLowerCase());
    }
    async getTimeline(userId, cursor, limit = 20) {
        try {
            const following = await this.prisma.follow.findMany({
                where: { followerId: userId },
                select: { followeeId: true },
            });
            const followingIds = following.map(f => f.followeeId);
            followingIds.push(userId);
            const pagination = cursor
                ? { take: limit, cursor: { id: cursor }, skip: 1 }
                : { take: limit };
            const posts = await this.prisma.post.findMany({
                where: {
                    authorId: { in: followingIds },
                },
                ...pagination,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: true,
                    hashtags: {
                        include: {
                            hashtag: true,
                        },
                    },
                },
            });
            const timeline = posts.map(post => ({
                id: post.id,
                text: post.text,
                createdAt: post.createdAt.toISOString(),
                author: {
                    id: post.author.id,
                    handle: post.author.handle,
                },
                hashtags: post.hashtags.map(h => h.hashtag.name),
                mediaUrl: post.mediaUrl,
            }));
            return api_response_1.ApiResponse.success(timeline);
        }
        catch (error) {
            return api_response_1.ApiResponse.error('Failed to get timeline');
        }
    }
    async getUserPosts(handle) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { handle },
            });
            if (!user) {
                const remoteUser = await this.prisma.remoteUser.findFirst({
                    where: { handle },
                });
                if (!remoteUser) {
                    return api_response_1.ApiResponse.error(`User with handle @${handle} not found`);
                }
                const posts = await this.prisma.post.findMany({
                    where: {
                        remoteAuthorId: remoteUser.id,
                    },
                    include: {
                        remoteAuthor: true,
                        hashtags: {
                            include: {
                                hashtag: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return api_response_1.ApiResponse.success(posts.map(post => ({
                    id: post.id,
                    text: post.text,
                    createdAt: post.createdAt.toISOString(),
                    author: {
                        id: post.remoteAuthor.id,
                        handle: post.remoteAuthor.handle || 'remote-user',
                    },
                    hashtags: post.hashtags.map(relation => relation.hashtag.name),
                })));
            }
            const posts = await this.prisma.post.findMany({
                where: {
                    authorId: user.id,
                },
                include: {
                    author: true,
                    hashtags: {
                        include: {
                            hashtag: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return api_response_1.ApiResponse.success(posts.map(post => ({
                id: post.id,
                text: post.text,
                createdAt: post.createdAt.toISOString(),
                author: {
                    id: post.author.id,
                    handle: post.author.handle,
                },
                hashtags: post.hashtags.map(relation => relation.hashtag.name),
            })));
        }
        catch (error) {
            return api_response_1.ApiResponse.error('Failed to fetch user posts');
        }
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_service_1.EventService])
], PostService);
//# sourceMappingURL=post.service.js.map
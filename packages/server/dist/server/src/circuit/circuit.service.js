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
var CircuitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const api_response_1 = require("../common/api-response");
let CircuitService = CircuitService_1 = class CircuitService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CircuitService_1.name);
    }
    async createManual(name, description, ownerId) {
        try {
            if (!name.trim()) {
                return api_response_1.ApiResponse.error('Circuit name is required');
            }
            const circuit = await this.prisma.circuit.create({
                data: {
                    name,
                    description,
                    ownerId,
                    isAlgo: false,
                },
            });
            return api_response_1.ApiResponse.success({
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                ownerId: circuit.ownerId,
                isAlgo: circuit.isAlgo,
                query: circuit.query,
                createdAt: circuit.createdAt.toISOString(),
                followersCount: 0,
                postsCount: 0,
            });
        }
        catch (error) {
            this.logger.error(`Error creating circuit: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to create circuit');
        }
    }
    async createAlgorithmic(name, description, ownerId, query) {
        try {
            if (!name.trim()) {
                return api_response_1.ApiResponse.error('Circuit name is required');
            }
            if (!query || (!query.hashtags?.length && !query.minLikes)) {
                return api_response_1.ApiResponse.error('Algorithmic circuit requires at least one filter criterion');
            }
            const circuit = await this.prisma.circuit.create({
                data: {
                    name,
                    description,
                    ownerId,
                    isAlgo: true,
                    query: JSON.stringify(query),
                },
            });
            return api_response_1.ApiResponse.success({
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                ownerId: circuit.ownerId,
                isAlgo: circuit.isAlgo,
                query: circuit.query,
                createdAt: circuit.createdAt.toISOString(),
                followersCount: 0,
                postsCount: 0,
            });
        }
        catch (error) {
            this.logger.error(`Error creating algorithmic circuit: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to create algorithmic circuit');
        }
    }
    async addPost(circuitId, postId, curatorId) {
        try {
            const circuit = await this.prisma.circuit.findUnique({
                where: { id: circuitId },
            });
            if (!circuit) {
                return api_response_1.ApiResponse.error('Circuit not found');
            }
            if (circuit.ownerId !== curatorId) {
                return api_response_1.ApiResponse.error('Only the circuit owner can add posts');
            }
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                return api_response_1.ApiResponse.error('Post not found');
            }
            await this.prisma.circuitPost.upsert({
                where: {
                    circuitId_postId: {
                        circuitId,
                        postId,
                    },
                },
                update: {},
                create: {
                    circuitId,
                    postId,
                },
            });
            return api_response_1.ApiResponse.success(true);
        }
        catch (error) {
            this.logger.error(`Error adding post to circuit: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to add post to circuit');
        }
    }
    async follow(circuitId, userId) {
        try {
            const circuit = await this.prisma.circuit.findUnique({
                where: { id: circuitId },
            });
            if (!circuit) {
                return api_response_1.ApiResponse.error('Circuit not found');
            }
            await this.prisma.circuitFollow.upsert({
                where: {
                    circuitId_userId: {
                        circuitId,
                        userId,
                    },
                },
                update: {},
                create: {
                    circuitId,
                    userId,
                },
            });
            return api_response_1.ApiResponse.success(true);
        }
        catch (error) {
            this.logger.error(`Error following circuit: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to follow circuit');
        }
    }
    async unfollow(circuitId, userId) {
        try {
            await this.prisma.circuitFollow.deleteMany({
                where: {
                    circuitId,
                    userId,
                },
            });
            return api_response_1.ApiResponse.success(true);
        }
        catch (error) {
            this.logger.error(`Error unfollowing circuit: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to unfollow circuit');
        }
    }
    async getById(circuitId, currentUserId) {
        try {
            const circuit = await this.prisma.circuit.findUnique({
                where: { id: circuitId },
                include: {
                    owner: true,
                    _count: {
                        select: {
                            followers: true,
                            posts: true,
                        },
                    },
                },
            });
            if (!circuit) {
                return api_response_1.ApiResponse.error('Circuit not found');
            }
            let isFollowing = false;
            if (currentUserId) {
                const follow = await this.prisma.circuitFollow.findUnique({
                    where: {
                        circuitId_userId: {
                            circuitId,
                            userId: currentUserId,
                        },
                    },
                });
                isFollowing = !!follow;
            }
            return api_response_1.ApiResponse.success({
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                ownerId: circuit.ownerId,
                ownerHandle: circuit.owner?.handle,
                isAlgo: circuit.isAlgo,
                query: circuit.query,
                createdAt: circuit.createdAt.toISOString(),
                followersCount: circuit._count.followers,
                postsCount: circuit._count.posts,
                isFollowing,
            });
        }
        catch (error) {
            this.logger.error(`Error getting circuit: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to get circuit details');
        }
    }
    async listDirectory(cursor, limit = 20, currentUserId) {
        try {
            const take = limit + 1;
            const query = {
                take,
                orderBy: [
                    { followers: { _count: 'desc' } },
                    { createdAt: 'desc' },
                ],
                include: {
                    owner: true,
                    _count: {
                        select: {
                            followers: true,
                            posts: true,
                        },
                    },
                },
            };
            if (cursor) {
                const [id, createdAt] = cursor.split('_');
                query.cursor = {
                    id,
                };
                query.skip = 1;
            }
            const circuits = await this.prisma.circuit.findMany(query);
            let nextCursor = undefined;
            if (circuits.length > limit) {
                const lastCircuit = circuits[limit - 1];
                nextCursor = `${lastCircuit.id}_${lastCircuit.createdAt.toISOString()}`;
                circuits.pop();
            }
            const followedCircuitIds = new Set();
            if (currentUserId) {
                const follows = await this.prisma.circuitFollow.findMany({
                    where: {
                        userId: currentUserId,
                    },
                    select: {
                        circuitId: true,
                    },
                });
                follows.forEach(follow => followedCircuitIds.add(follow.circuitId));
            }
            const formattedCircuits = circuits.map(circuit => ({
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                ownerId: circuit.ownerId,
                ownerHandle: circuit.owner?.handle,
                isAlgo: circuit.isAlgo,
                query: circuit.query,
                createdAt: circuit.createdAt.toISOString(),
                followersCount: circuit._count.followers,
                postsCount: circuit._count.posts,
                isFollowing: followedCircuitIds.has(circuit.id),
            }));
            return api_response_1.ApiResponse.success({
                circuits: formattedCircuits,
                nextCursor,
            });
        }
        catch (error) {
            this.logger.error(`Error listing circuits: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to list circuits');
        }
    }
    async listFeed(circuitId, cursor, limit = 20, currentUserId) {
        try {
            const circuit = await this.prisma.circuit.findUnique({
                where: { id: circuitId },
                include: {
                    owner: true,
                    _count: {
                        select: {
                            followers: true,
                            posts: true,
                        },
                    },
                },
            });
            if (!circuit) {
                return api_response_1.ApiResponse.error('Circuit not found');
            }
            let isFollowing = false;
            if (currentUserId) {
                const follow = await this.prisma.circuitFollow.findUnique({
                    where: {
                        circuitId_userId: {
                            circuitId,
                            userId: currentUserId,
                        },
                    },
                });
                isFollowing = !!follow;
            }
            const circuitData = {
                id: circuit.id,
                name: circuit.name,
                description: circuit.description,
                ownerId: circuit.ownerId,
                ownerHandle: circuit.owner?.handle,
                isAlgo: circuit.isAlgo,
                query: circuit.query,
                createdAt: circuit.createdAt.toISOString(),
                followersCount: circuit._count.followers,
                postsCount: circuit._count.posts,
                isFollowing,
            };
            const take = limit + 1;
            const query = {
                take,
                where: {
                    circuitId,
                },
                orderBy: {
                    addedAt: 'desc',
                },
                include: {
                    post: {
                        include: {
                            author: true,
                            remoteAuthor: true,
                        },
                    },
                },
            };
            if (cursor) {
                const [postId, addedAt] = cursor.split('_');
                query.cursor = {
                    circuitId_postId: {
                        circuitId,
                        postId,
                    },
                };
                query.skip = 1;
            }
            const circuitPosts = await this.prisma.circuitPost.findMany(query);
            let nextCursor = undefined;
            if (circuitPosts.length > limit) {
                const lastPost = circuitPosts[limit - 1];
                nextCursor = `${lastPost.postId}_${lastPost.addedAt.toISOString()}`;
                circuitPosts.pop();
            }
            const posts = await Promise.all(circuitPosts.map(async (cp) => {
                const postId = cp.postId;
                const post = await this.prisma.post.findUnique({
                    where: { id: postId },
                    include: {
                        author: true,
                        remoteAuthor: true
                    }
                });
                const isLocal = !!post.authorId;
                const author = isLocal ? post.author : post.remoteAuthor;
                return {
                    circuitId: cp.circuitId,
                    post: {
                        id: post.id,
                        text: post.text,
                        authorId: post.authorId || post.remoteAuthorId,
                        authorHandle: author?.handle,
                        createdAt: post.createdAt.toISOString(),
                        isRemote: !isLocal,
                        federationId: post.federationId,
                    },
                    addedAt: cp.addedAt.toISOString(),
                };
            }));
            return api_response_1.ApiResponse.success({
                circuit: circuitData,
                posts,
                nextCursor,
            });
        }
        catch (error) {
            this.logger.error(`Error getting circuit feed: ${error.message}`, error.stack);
            return api_response_1.ApiResponse.error('Failed to get circuit feed');
        }
    }
    mapCircuitToDTO(circuit) {
        let ownerHandle = null;
        if ('owner' in circuit && circuit.owner) {
            ownerHandle = circuit.owner.handle;
        }
        let followersCount = 0;
        let postsCount = 0;
        if ('_count' in circuit && circuit._count) {
            followersCount = circuit._count.followers || 0;
            postsCount = circuit._count.posts || 0;
        }
        return {
            id: circuit.id,
            name: circuit.name,
            description: circuit.description,
            query: circuit.query,
            isAlgo: circuit.isAlgo,
            createdAt: circuit.createdAt,
            ownerHandle,
            ownerId: circuit.ownerId,
            followersCount,
            postsCount,
        };
    }
};
exports.CircuitService = CircuitService;
exports.CircuitService = CircuitService = CircuitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CircuitService);
//# sourceMappingURL=circuit.service.js.map
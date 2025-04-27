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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let SearchService = SearchService_1 = class SearchService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async search(query, cursor, limit = 20) {
        try {
            const searchTerms = query
                .toLowerCase()
                .replace(/[^\w\s#]/g, '')
                .split(/\s+/)
                .filter(term => term.length > 0);
            if (searchTerms.length === 0) {
                return { posts: [], nextCursor: null };
            }
            const hashtags = searchTerms
                .filter(term => term.startsWith('#'))
                .map(tag => tag.slice(1));
            const regularTerms = searchTerms.filter(term => !term.startsWith('#'));
            const where = {
                indexed: true,
                OR: []
            };
            if (hashtags.length > 0) {
                where.OR.push({
                    hashtags: {
                        some: {
                            hashtag: {
                                name: { in: hashtags }
                            }
                        }
                    }
                });
            }
            if (regularTerms.length > 0) {
                regularTerms.forEach(term => {
                    where.OR.push({ text: { contains: term, mode: 'insensitive' } });
                });
            }
            const paginationParams = cursor
                ? { take: limit + 1, cursor: { id: cursor }, skip: 1 }
                : { take: limit + 1 };
            const posts = await this.prisma.post.findMany({
                ...paginationParams,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            handle: true,
                        },
                    },
                    remoteAuthor: {
                        select: {
                            id: true,
                            handle: true,
                        }
                    },
                    hashtags: {
                        include: {
                            hashtag: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    }
                },
                where,
            });
            const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;
            const mappedPosts = await this.mapPostsToDTO(posts);
            return {
                posts: mappedPosts,
                nextCursor,
            };
        }
        catch (error) {
            this.logger.error(`Error searching posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTrendingTags(limit = 10) {
        try {
            const trendingPeriod = new Date();
            trendingPeriod.setHours(trendingPeriod.getHours() - 1);
            const trendingTags = await this.prisma.hashtag.findMany({
                where: {
                    posts: {
                        some: {
                            createdAt: { gte: trendingPeriod },
                        },
                    },
                },
                orderBy: {
                    posts: {
                        _count: 'desc',
                    },
                },
                take: limit,
                select: {
                    name: true,
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    createdAt: { gte: trendingPeriod },
                                },
                            },
                        },
                    },
                },
            });
            return trendingTags.map((tag) => ({
                name: tag.name,
                count: tag._count.posts,
            }));
        }
        catch (error) {
            this.logger.error(`Error fetching trending tags: ${error.message}`, error.stack);
            throw error;
        }
    }
    extractHashtags(text) {
        if (!text)
            return [];
        const hashtagRegex = /#(\w+)/g;
        const matches = text.match(hashtagRegex);
        if (!matches)
            return [];
        return matches.map(tag => tag.substring(1).toLowerCase());
    }
    async mapPostsToDTO(posts) {
        if (posts.length === 0)
            return [];
        return posts.map(post => {
            const authorInfo = post.author || post.remoteAuthor;
            const hashtags = post.hashtags?.map(relation => relation.hashtag.name) || [];
            return {
                id: post.id,
                text: post.text,
                createdAt: post.createdAt.toISOString(),
                author: {
                    id: authorInfo?.id || 'unknown',
                    handle: authorInfo?.handle || 'unknown',
                },
                hashtags: hashtags
            };
        });
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SearchService);
//# sourceMappingURL=search.service.js.map
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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const api_response_1 = require("../common/api-response");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(handle, currentUserId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { handle },
            });
            if (!user) {
                return api_response_1.ApiResponse.error(`User with handle @${handle} not found`);
            }
            const followersCount = await this.prisma.follow.count({
                where: { followeeId: user.id },
            });
            const followingCount = await this.prisma.follow.count({
                where: { followerId: user.id },
            });
            let isFollowing = false;
            if (currentUserId) {
                const followRecord = await this.prisma.follow.findUnique({
                    where: {
                        followerId_followeeId: {
                            followerId: currentUserId,
                            followeeId: user.id,
                        },
                    },
                });
                isFollowing = !!followRecord;
            }
            return api_response_1.ApiResponse.success({
                id: user.id,
                handle: user.handle,
                createdAt: user.createdAt.toISOString(),
                followersCount,
                followingCount,
                isFollowing,
            });
        }
        catch (error) {
            return api_response_1.ApiResponse.error('Failed to fetch user profile');
        }
    }
    async followUser(followerId, followeeHandle) {
        try {
            const followee = await this.prisma.user.findUnique({
                where: { handle: followeeHandle },
            });
            if (!followee) {
                return api_response_1.ApiResponse.error(`User with handle @${followeeHandle} not found`);
            }
            if (followerId === followee.id) {
                return api_response_1.ApiResponse.error('You cannot follow yourself');
            }
            const existingFollow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followeeId: {
                        followerId,
                        followeeId: followee.id,
                    },
                },
            });
            if (existingFollow) {
                return api_response_1.ApiResponse.success(true);
            }
            await this.prisma.follow.create({
                data: {
                    followerId,
                    followeeId: followee.id,
                },
            });
            return api_response_1.ApiResponse.success(true);
        }
        catch (error) {
            return api_response_1.ApiResponse.error('Failed to follow user');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map
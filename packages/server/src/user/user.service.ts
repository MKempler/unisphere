import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(handle: string, currentUserId?: string): Promise<ApiResponse<ProfileDTO>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { handle },
      });

      if (!user) {
        return ApiResponse.error(`User with handle @${handle} not found`);
      }

      // Get follower and following counts
      const followersCount = await this.prisma.follow.count({
        where: { followeeId: user.id },
      });

      const followingCount = await this.prisma.follow.count({
        where: { followerId: user.id },
      });

      // Check if current user is following the profile user
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

      return ApiResponse.success({
        id: user.id,
        handle: user.handle,
        createdAt: user.createdAt.toISOString(),
        followersCount,
        followingCount,
        isFollowing,
      });
    } catch (error) {
      return ApiResponse.error('Failed to fetch user profile');
    }
  }

  async followUser(followerId: string, followeeHandle: string): Promise<ApiResponse<boolean>> {
    try {
      // Find the user to follow
      const followee = await this.prisma.user.findUnique({
        where: { handle: followeeHandle },
      });

      if (!followee) {
        return ApiResponse.error(`User with handle @${followeeHandle} not found`);
      }

      // Don't allow users to follow themselves
      if (followerId === followee.id) {
        return ApiResponse.error('You cannot follow yourself');
      }

      // Check if already following
      const existingFollow = await this.prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId,
            followeeId: followee.id,
          },
        },
      });

      // If already following, return true
      if (existingFollow) {
        return ApiResponse.success(true);
      }

      // Create follow relationship
      await this.prisma.follow.create({
        data: {
          followerId,
          followeeId: followee.id,
        },
      });

      return ApiResponse.success(true);
    } catch (error) {
      return ApiResponse.error('Failed to follow user');
    }
  }
} 
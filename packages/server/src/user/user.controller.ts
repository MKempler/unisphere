import { Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { ProfileDTO } from '@unisphere/shared';

@ApiTags('users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:handle')
  @ApiOperation({ summary: 'Get a user profile by handle' })
  @ApiResponse({ status: 200, description: 'User profile found', type: ProfileDTO })
  async getProfile(@Param('handle') handle: string, @Request() req: any): Promise<ProfileDTO> {
    const currentUserId = req.user?.id;
    return this.userService.getProfile(handle, currentUserId);
  }

  @Post('follow/:handle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 200, description: 'Follow request processed' })
  async followUser(
    @Param('handle') handle: string,
    @Request() req: any,
  ): Promise<{ success: boolean }> {
    const success = await this.userService.followUser(req.user.id, handle);
    return { success };
  }
} 
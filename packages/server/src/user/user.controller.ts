import { Controller, Get, Param, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { ProfileDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';

@ApiTags('users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:handle')
  @ApiOperation({ summary: 'Get a user profile by handle' })
  @SwaggerResponse({ status: 200, description: 'User profile found' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async getProfile(@Param('handle') handle: string, @Request() req: any): Promise<ApiResponse<ProfileDTO>> {
    const currentUserId = req.user?.id;
    const result = await this.userService.getProfile(handle, currentUserId);
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Post('follow/:handle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  @SwaggerResponse({ status: 200, description: 'Follow request processed' })
  @SwaggerResponse({ status: 400, description: 'Bad request' })
  async followUser(
    @Param('handle') handle: string,
    @Request() req: any,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const result = await this.userService.followUser(req.user.id, handle);
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return ApiResponse.success({ success: result.data });
  }
} 
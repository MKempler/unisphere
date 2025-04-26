import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';

class PresignDto {
  mimeType: string;
}

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned URL for direct upload to storage' })
  @SwaggerResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid mime type' })
  async getPresignedUrl(@Body() presignDto: PresignDto) {
    if (!presignDto.mimeType) {
      throw new BadRequestException('mimeType is required');
    }
    
    try {
      const presignedData = await this.mediaService.generatePresignedUrl(presignDto.mimeType);
      return presignedData;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to generate presigned URL');
    }
  }
} 
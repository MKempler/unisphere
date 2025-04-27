import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search posts by query' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'cursor', description: 'Pagination cursor (post ID)', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of results to return', required: false })
  async search(
    @Query('q') query: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.searchService.search(query, cursor, limit ? parseInt(limit as unknown as string) : 20);
  }

  @Get('trending')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get trending hashtags' })
  @ApiQuery({ name: 'limit', description: 'Number of trending tags to return', required: false })
  async getTrendingTags(@Query('limit') limit?: number): Promise<any> {
    return this.searchService.getTrendingTags(limit ? parseInt(limit as unknown as string) : 10);
  }
} 
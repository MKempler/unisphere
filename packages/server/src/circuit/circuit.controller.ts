import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CircuitService } from './circuit.service';
import { ApiResponse } from '../common/api-response';

@ApiTags('circuits')
@Controller('circuits')
export class CircuitController {
  constructor(private readonly circuitService: CircuitService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new circuit' })
  @SwaggerResponse({ status: 201, description: 'Circuit created successfully' })
  async createCircuit(
    @Body() createCircuitDto: any,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    // Handle based on circuit type (manual vs. algorithmic)
    if (createCircuitDto.isAlgo) {
      if (!createCircuitDto.query) {
        throw new BadRequestException('Algorithmic circuit requires a query');
      }
      
      try {
        const query = JSON.parse(createCircuitDto.query);
        const result = await this.circuitService.createAlgorithmic(
          createCircuitDto.name,
          createCircuitDto.description,
          req.user.id,
          query,
        );
        
        if (!result.ok) {
          throw new BadRequestException(result.error);
        }
        
        return result;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Invalid query format');
      }
    } else {
      // Create manual circuit
      const result = await this.circuitService.createManual(
        createCircuitDto.name,
        createCircuitDto.description,
        req.user.id,
      );
      
      if (!result.ok) {
        throw new BadRequestException(result.error);
      }
      
      return result;
    }
  }

  @Post(':id/add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a post to a circuit' })
  @SwaggerResponse({ status: 200, description: 'Post added to circuit successfully' })
  async addPost(
    @Param('id') circuitId: string,
    @Body('postId') postId: string,
    @Request() req: any,
  ): Promise<ApiResponse<boolean>> {
    if (!postId) {
      throw new BadRequestException('Post ID is required');
    }
    
    const result = await this.circuitService.addPost(
      circuitId,
      postId,
      req.user.id,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a circuit' })
  @SwaggerResponse({ status: 200, description: 'Circuit followed successfully' })
  async followCircuit(
    @Param('id') circuitId: string,
    @Request() req: any,
  ): Promise<ApiResponse<boolean>> {
    const result = await this.circuitService.follow(
      circuitId,
      req.user.id,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Post(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a circuit' })
  @SwaggerResponse({ status: 200, description: 'Circuit unfollowed successfully' })
  async unfollowCircuit(
    @Param('id') circuitId: string,
    @Request() req: any,
  ): Promise<ApiResponse<boolean>> {
    const result = await this.circuitService.unfollow(
      circuitId,
      req.user.id,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a circuit by ID' })
  @SwaggerResponse({ status: 200, description: 'Circuit retrieved successfully' })
  async getCircuit(
    @Param('id') circuitId: string,
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.circuitService.getById(
      circuitId,
      req.user.id,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List circuits directory ordered by popularity' })
  @SwaggerResponse({ status: 200, description: 'Circuits listed successfully' })
  async listCircuits(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.circuitService.listDirectory(
      cursor,
      limit ? Number(limit) : undefined,
      req.user.id,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }

  @Get(':id/feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get circuit feed (posts in the circuit)' })
  @SwaggerResponse({ status: 200, description: 'Circuit feed retrieved successfully' })
  async getCircuitFeed(
    @Param('id') circuitId: string,
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.circuitService.listFeed(
      circuitId,
      cursor,
      limit ? Number(limit) : undefined,
      req.user.id,
    );
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }
} 
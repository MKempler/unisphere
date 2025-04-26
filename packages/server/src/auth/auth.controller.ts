import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SignupCallbackDto } from './dto/auth.dto';
import { AuthResponseDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Request a magic link for signup/signin' })
  @SwaggerResponse({ status: 200, description: 'Token sent successfully' })
  @SwaggerResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupDto): Promise<ApiResponse<{ message: string }>> {
    const result = await this.authService.signup(signupDto.email, signupDto.inviteCode);
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return ApiResponse.success({ message: 'Magic link sent successfully' });
  }

  @Post('callback')
  @ApiOperation({ summary: 'Verify magic link token and authenticate user' })
  @SwaggerResponse({ status: 200, description: 'User authenticated successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid or expired token' })
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() callbackDto: SignupCallbackDto): Promise<ApiResponse<AuthResponseDTO>> {
    const result = await this.authService.verifyCallbackToken(callbackDto.token, callbackDto.inviteCode);
    
    if (!result.ok) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }
} 
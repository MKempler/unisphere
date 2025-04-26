import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SignupCallbackDto } from './dto/auth.dto';
import { AuthResponseDTO } from '@unisphere/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Request a magic link for signup/signin' })
  @ApiResponse({ status: 200, description: 'Token sent successfully' })
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupDto): Promise<{ message: string }> {
    await this.authService.signup(signupDto.email);
    return { message: 'Magic link sent successfully' };
  }

  @Post('callback')
  @ApiOperation({ summary: 'Verify magic link token and authenticate user' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully', type: AuthResponseDTO })
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() callbackDto: SignupCallbackDto): Promise<AuthResponseDTO> {
    return this.authService.verifyCallbackToken(callbackDto.token);
  }
} 
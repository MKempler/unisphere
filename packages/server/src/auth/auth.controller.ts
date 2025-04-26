import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SignupCallbackDto, ClaimDto, ConfirmDto, ForgotPasswordDto } from './dto/auth.dto';
import { AuthResponseDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Request a magic link for signup/signin' })
  @SwaggerResponse({ status: 200, description: 'Token sent successfully' })
  @SwaggerResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  async signup(@Body() dto: SignupDto): Promise<ApiResponse<{ message: string }>> {
    // Validate hCaptcha token if secret key is set
    const secret = this.configService.get<string>('HCAPTCHA_SECRET_KEY');
    if (secret && !dto.captchaToken) {
      throw new BadRequestException('Captcha verification required');
    }

    if (secret && dto.captchaToken) {
      try {
        const response = await fetch('https://hcaptcha.com/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            secret,
            response: dto.captchaToken,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new BadRequestException('Captcha verification failed');
        }
      } catch (error) {
        throw new BadRequestException('Error verifying captcha');
      }
    }

    // Continue with signup process after successful verification
    await this.authService.signup(dto);
    return ApiResponse.success({ message: 'Magic link sent to your email' });
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

  @Public()
  @Post('confirm')
  async confirm(@Body() dto: ConfirmDto) {
    const result = await this.authService.confirmMagicLink(dto.token);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Post('claim')
  @ApiOperation({ summary: 'Claim a migrated account' })
  @SwaggerResponse({ status: 200, description: 'Account claimed successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid import data or invite code' })
  @HttpCode(HttpStatus.OK)
  async claim(@Body() dto: ClaimDto): Promise<ApiResponse<{ message: string }>> {
    try {
      const result = await this.authService.claimUserHandle(dto.token, dto.handle);
      return ApiResponse.success({ message: 'Account claimed successfully. Check your email for a magic link to log in.' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.sendPasswordResetLink(dto.email);
    return {
      success: true,
      data: {
        message: 'Password reset link sent to your email',
      },
    };
  }
} 
import { AuthService } from './auth.service';
import { SignupDto, SignupCallbackDto, ClaimDto, ConfirmDto, ForgotPasswordDto } from './dto/auth.dto';
import { AuthResponseDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    private readonly jwtService;
    constructor(authService: AuthService, configService: ConfigService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<ApiResponse<{
        message: string;
    }>>;
    verifyToken(callbackDto: SignupCallbackDto): Promise<ApiResponse<AuthResponseDTO>>;
    confirm(dto: ConfirmDto): Promise<{
        success: boolean;
        data: {
            success: boolean;
        };
    }>;
    claim(dto: ClaimDto): Promise<ApiResponse<{
        message: string;
    }>>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}

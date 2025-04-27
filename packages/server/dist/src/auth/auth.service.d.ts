import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../common/mailer.service';
import { AuthResponseDTO } from '@unisphere/shared';
import { ApiResponse } from '../common/api-response';
import { SignupDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly mailerService;
    private magicLinkTokens;
    constructor(prisma: PrismaService, jwtService: JwtService, mailerService: MailerService);
    signup(dto: SignupDto): Promise<ApiResponse<string>>;
    confirmMagicLink(token: string): Promise<{
        success: boolean;
    }>;
    claimUserHandle(token: string, handle: string): Promise<ApiResponse<string>>;
    sendPasswordResetLink(email: string): Promise<{
        success: boolean;
    }>;
    verifyCallbackToken(token: string, inviteCode?: string): Promise<ApiResponse<AuthResponseDTO>>;
    private generateDidKeyPair;
    claimAccount(exportJsonStr: string, inviteCode: string, newEmail: string): Promise<ApiResponse<string>>;
}

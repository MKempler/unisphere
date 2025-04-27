"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const api_response_1 = require("../common/api-response");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("./decorators/public.decorator");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    constructor(authService, configService, jwtService) {
        this.authService = authService;
        this.configService = configService;
        this.jwtService = jwtService;
    }
    async signup(dto) {
        const secret = this.configService.get('HCAPTCHA_SECRET_KEY');
        if (secret && !dto.captchaToken) {
            throw new common_1.BadRequestException('Captcha verification required');
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
                    throw new common_1.BadRequestException('Captcha verification failed');
                }
            }
            catch (error) {
                throw new common_1.BadRequestException('Error verifying captcha');
            }
        }
        try {
            await this.authService.signup(dto);
            return api_response_1.ApiResponse.success({ message: 'Magic link sent to your email' });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Email already registered');
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async verifyToken(callbackDto) {
        const result = await this.authService.verifyCallbackToken(callbackDto.token, callbackDto.inviteCode);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
    async confirm(dto) {
        const result = await this.authService.confirmMagicLink(dto.token);
        return {
            success: true,
            data: result,
        };
    }
    async claim(dto) {
        try {
            const result = await this.authService.claimUserHandle(dto.token, dto.handle);
            return api_response_1.ApiResponse.success({ message: 'Account claimed successfully. Check your email for a magic link to log in.' });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Handle already taken');
            }
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async forgotPassword(dto) {
        try {
            await this.authService.sendPasswordResetLink(dto.email);
            return {
                success: true,
                message: 'Password reset link sent to your email',
            };
        }
        catch (error) {
            return {
                success: true,
                message: 'If the email exists, a password reset link has been sent',
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Request a magic link for signup/signin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify magic link token and authenticate user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User authenticated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupCallbackDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ConfirmDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirm", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Claim a migrated account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account claimed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid import data or invite code' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ClaimDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "claim", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
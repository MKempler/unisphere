import { SignupRequestDTO, SignupCallbackDTO } from '@unisphere/shared';
export declare class SignupDto implements SignupRequestDTO {
    email: string;
    inviteCode?: string;
    captchaToken?: string;
}
export declare class SignupCallbackDto implements SignupCallbackDTO {
    token: string;
    inviteCode?: string;
}
export declare class ClaimDto {
    handle: string;
    token: string;
}
export declare class ConfirmDto {
    token: string;
}
export declare class ForgotPasswordDto {
    email: string;
}

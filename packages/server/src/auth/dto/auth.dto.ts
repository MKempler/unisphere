import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SignupRequestDTO, SignupCallbackDTO } from '@unisphere/shared';

export class SignupDto implements SignupRequestDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  inviteCode?: string;
}

export class SignupCallbackDto implements SignupCallbackDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  inviteCode?: string;
} 
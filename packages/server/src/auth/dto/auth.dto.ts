import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { SignupRequestDTO, SignupCallbackDTO } from '@unisphere/shared';

export class SignupDto implements SignupRequestDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SignupCallbackDto implements SignupCallbackDTO {
  @IsString()
  @IsNotEmpty()
  token: string;
} 
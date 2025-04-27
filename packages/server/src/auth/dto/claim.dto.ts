import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimDto {
  @IsString()
  @IsNotEmpty()
  handle: string;

  @IsString()
  @IsNotEmpty()
  token: string;
} 
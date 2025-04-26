import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUrl } from 'class-validator';
import { CreatePostDTO } from '@unisphere/shared';

export class CreatePostDto implements CreatePostDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  text: string;
  
  @IsString()
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
} 
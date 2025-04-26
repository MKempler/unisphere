import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreatePostDTO } from '@unisphere/shared';

export class CreatePostDto implements CreatePostDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  text: string;
} 
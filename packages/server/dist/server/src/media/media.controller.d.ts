import { MediaService } from './media.service';
declare class PresignDto {
    mimeType: string;
}
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    getPresignedUrl(presignDto: PresignDto): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
}
export {};

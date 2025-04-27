import { ConfigService } from '@nestjs/config';
export declare class MediaService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly maxFileSizeMB;
    constructor(configService: ConfigService);
    generatePresignedUrl(mimeType: string): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
    private isValidMimeType;
    private getFileExtension;
    getMediaUrl(filename: string): string;
}

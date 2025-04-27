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
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const uuid_1 = require("uuid");
let MediaService = MediaService_1 = class MediaService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MediaService_1.name);
        const endpoint = this.configService.get('R2_ENDPOINT');
        const accessKeyId = this.configService.get('R2_ACCESS_KEY');
        const secretAccessKey = this.configService.get('R2_SECRET_KEY');
        const bucket = this.configService.get('R2_BUCKET');
        if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
            this.logger.warn('Missing R2 configuration. Media uploads will not work properly.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: endpoint || '',
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
        this.bucket = bucket || '';
        this.maxFileSizeMB = this.configService.get('MAX_FILE_MB', 5);
        this.logger.log(`Media service initialized with bucket: ${this.bucket}`);
        this.logger.log(`Max file size: ${this.maxFileSizeMB} MB`);
    }
    async generatePresignedUrl(mimeType) {
        if (!this.bucket) {
            throw new common_1.BadRequestException('Storage bucket not configured');
        }
        if (!this.isValidMimeType(mimeType)) {
            throw new common_1.BadRequestException('Invalid or unsupported file type');
        }
        const fileExtension = this.getFileExtension(mimeType);
        if (!fileExtension) {
            throw new common_1.BadRequestException('Could not determine file extension from mime type');
        }
        const filename = `${(0, uuid_1.v4)()}${fileExtension}`;
        const key = `uploads/${filename}`;
        try {
            const { url, fields } = await (0, s3_presigned_post_1.createPresignedPost)(this.s3Client, {
                Bucket: this.bucket,
                Key: key,
                Conditions: [
                    ['content-length-range', 0, this.maxFileSizeMB * 1024 * 1024],
                    ['eq', '$Content-Type', mimeType],
                ],
                Fields: {
                    'Content-Type': mimeType,
                },
                Expires: 300,
            });
            this.logger.debug(`Created presigned URL for ${key}`);
            return { url, fields };
        }
        catch (error) {
            this.logger.error(`Error creating presigned URL: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to generate upload URL');
        }
    }
    isValidMimeType(mimeType) {
        const supportedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        return supportedTypes.includes(mimeType);
    }
    getFileExtension(mimeType) {
        const mimeToExt = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
        };
        return mimeToExt[mimeType] || '';
    }
    getMediaUrl(filename) {
        const bucketUrl = this.configService.get('R2_PUBLIC_URL') ||
            `${this.configService.get('R2_ENDPOINT') || ''}/${this.bucket}`;
        return `${bucketUrl}/uploads/${filename}`;
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map
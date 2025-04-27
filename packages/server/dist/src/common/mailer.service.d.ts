export declare class MailerService {
    private readonly logger;
    private readonly isDevelopment;
    private readonly fromEmail;
    private readonly clientBaseUrl;
    constructor();
    sendMagicLink(to: string, token: string): Promise<void>;
}

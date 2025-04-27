"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const sendgrid = __importStar(require("@sendgrid/mail"));
let MailerService = MailerService_1 = class MailerService {
    constructor() {
        this.logger = new common_1.Logger(MailerService_1.name);
        if (process.env.SENDGRID_API_KEY) {
            sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
        }
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.fromEmail = process.env.MAIL_FROM || 'noreply@kavira.app';
        this.clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
    }
    async sendMagicLink(to, token) {
        const magicLinkUrl = `${this.clientBaseUrl}/auth/callback?token=${token}`;
        if (this.isDevelopment || !process.env.SENDGRID_API_KEY) {
            this.logger.log(`[Development] Magic link for ${to}: ${magicLinkUrl}`);
            return;
        }
        const msg = {
            to,
            from: this.fromEmail,
            subject: 'Your Kavira Magic Link',
            text: `Welcome to Kavira! Click this link to sign in: ${magicLinkUrl}`,
            html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kavira!</h2>
          <p>Click the button below to sign in to your account. This link is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Sign In to Kavira
            </a>
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #3B82F6;">${magicLinkUrl}</p>
          <p style="color: #6B7280; margin-top: 30px; font-size: 0.9em;">
            If you didn't request this email, you can safely ignore it.
          </p>
          <p style="color: #6B7280; font-size: 0.9em; margin-top: 20px;">
            Kavira - One world. Many voices.
          </p>
        </div>
      `,
        };
        try {
            await sendgrid.send(msg);
            this.logger.log(`Magic link email sent to ${to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send magic link email to ${to}`, error);
            throw new Error('Failed to send magic link email');
        }
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailerService);
//# sourceMappingURL=mailer.service.js.map
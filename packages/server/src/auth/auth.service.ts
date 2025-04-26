import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../common/mailer.service';
import { AuthResponseDTO, JWTPayload } from '@unisphere/shared';
import { encrypt } from '../common/crypto';
import { ApiResponse } from '../common/api-response';

@Injectable()
export class AuthService {
  // In-memory store of magic link tokens - in production this should be in Redis
  private magicLinkTokens: Record<string, { email: string; expires: Date }> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async signup(email: string, inviteCode?: string): Promise<ApiResponse<string>> {
    // If invite code is provided, check its validity
    if (inviteCode) {
      const invite = await this.prisma.invite.findUnique({
        where: { code: inviteCode },
      });
      
      if (!invite) {
        return ApiResponse.error('Invalid invite code');
      }
      
      if (invite.usedById) {
        return ApiResponse.error('Invite code has already been used');
      }
    }
    
    // Generate a token that expires in 15 minutes
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    // Store token with email
    this.magicLinkTokens[token] = { email, expires };

    // Send magic link via email
    try {
      await this.mailerService.sendMagicLink(email, token);
    } catch (error) {
      return ApiResponse.error('Failed to send magic link email');
    }
    
    return ApiResponse.success(token);
  }

  async verifyCallbackToken(token: string, inviteCode?: string): Promise<ApiResponse<AuthResponseDTO>> {
    const storedToken = this.magicLinkTokens[token];
    
    if (!storedToken) {
      return ApiResponse.error('Invalid or expired token');
    }
    
    if (new Date() > storedToken.expires) {
      delete this.magicLinkTokens[token];
      return ApiResponse.error('Token has expired');
    }
    
    const { email } = storedToken;
    
    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // If we're using invite codes and none was provided, don't allow creation
      if (process.env.REQUIRE_INVITE === 'true' && !inviteCode) {
        return ApiResponse.error('Invite code required for new user registration');
      }

      // If an invite code was provided, verify it
      if (inviteCode) {
        const invite = await this.prisma.invite.findUnique({
          where: { code: inviteCode },
        });
        
        if (!invite) {
          return ApiResponse.error('Invalid invite code');
        }
        
        if (invite.usedById) {
          return ApiResponse.error('Invite code has already been used');
        }
      }

      // Generate handle from email
      const baseHandle = email.split('@')[0].toLowerCase();
      
      // Create DID keys for the user (simplified in this MVP)
      const didKeyPair = this.generateDidKeyPair();
      
      // Try to create with the base handle, but handle could be taken
      try {
        user = await this.prisma.user.create({
          data: {
            email,
            handle: baseHandle,
            didPublicKey: didKeyPair.publicKey,
            didPrivateKeyEnc: didKeyPair.privateKeyEnc,
          },
        });
        
        // Mark invite as used if one was provided
        if (inviteCode) {
          await this.prisma.invite.update({
            where: { code: inviteCode },
            data: { usedById: user.id },
          });
        }
      } catch (error) {
        // If handle is taken, add a random suffix
        const randomSuffix = Math.floor(Math.random() * 10000);
        user = await this.prisma.user.create({
          data: {
            email,
            handle: `${baseHandle}${randomSuffix}`,
            didPublicKey: didKeyPair.publicKey,
            didPrivateKeyEnc: didKeyPair.privateKeyEnc,
          },
        });
        
        // Mark invite as used if one was provided
        if (inviteCode) {
          await this.prisma.invite.update({
            where: { code: inviteCode },
            data: { usedById: user.id },
          });
        }
      }
    }
    
    // Remove the used token
    delete this.magicLinkTokens[token];
    
    // Generate JWT
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      handle: user.handle,
    };
    
    const jwt = this.jwtService.sign(payload);
    
    return ApiResponse.success({
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
      },
    });
  }

  private generateDidKeyPair() {
    // In a real app, we'd use proper DID key generation
    // For this MVP, we'll simulate with a random value
    const publicKey = `did:key:${crypto.randomBytes(16).toString('hex')}`;
    const privateKey = crypto.randomBytes(32).toString('hex');
    
    // Encrypt the private key with AES-256-GCM using JWT_SECRET
    const privateKeyEnc = encrypt(privateKey);
    
    return {
      publicKey,
      privateKeyEnc,
    };
  }
} 
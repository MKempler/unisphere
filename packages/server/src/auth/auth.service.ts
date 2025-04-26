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

  async claimAccount(
    exportJsonStr: string, 
    inviteCode: string, 
    newEmail: string
  ): Promise<ApiResponse<string>> {
    // Verify invite code
    const invite = await this.prisma.invite.findUnique({
      where: { code: inviteCode },
    });
    
    if (!invite) {
      return ApiResponse.error('Invalid invite code');
    }
    
    if (invite.usedById) {
      return ApiResponse.error('Invite code has already been used');
    }

    // Parse export data
    let exportData;
    try {
      exportData = JSON.parse(exportJsonStr);
    } catch (error) {
      return ApiResponse.error('Invalid export data format');
    }

    // Validate required fields
    if (!exportData.handle || !exportData.didPublicKey || !exportData.didPrivateKeyEnc) {
      return ApiResponse.error('Export data is missing required fields');
    }

    // Check if handle exists
    const existingUser = await this.prisma.user.findUnique({
      where: { handle: exportData.handle },
    });

    if (existingUser) {
      return ApiResponse.error('Handle is already taken on this server');
    }

    // Create user with imported data
    try {
      const user = await this.prisma.user.create({
        data: {
          email: newEmail,
          handle: exportData.handle,
          didPublicKey: exportData.didPublicKey,
          didPrivateKeyEnc: exportData.didPrivateKeyEnc,
        },
      });

      // Mark invite as used
      await this.prisma.invite.update({
        where: { code: inviteCode },
        data: { usedById: user.id },
      });

      // Import followers with pending-migrate status
      if (exportData.followers && Array.isArray(exportData.followers)) {
        // For each follower, create placeholder entries in the follow table
        for (const follower of exportData.followers) {
          // First, check if this is a remote user we already know about
          let remoteUser = await this.prisma.remoteUser.findFirst({
            where: { handle: follower.followerHandle }
          });
          
          if (!remoteUser) {
            // Create a placeholder remote user
            remoteUser = await this.prisma.remoteUser.create({
              data: {
                handle: follower.followerHandle,
                did: `placeholder-did-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
              }
            });
          }
          
          // We'll add more sophisticated federation handling in the federation system
        }
      }

      // Send magic link to complete signup
      return await this.signup(newEmail);
    } catch (error) {
      console.error('Failed to claim account:', error);
      return ApiResponse.error('Failed to claim account');
    }
  }
} 
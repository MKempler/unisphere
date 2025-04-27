import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JWTPayload } from '@unisphere/shared';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validate(payload: JWTPayload): Promise<{
        id: string;
        email: string;
        handle: string;
    }>;
}
export {};

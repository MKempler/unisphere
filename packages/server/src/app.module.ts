import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerService } from './common/mailer.service';
import { AuthModule } from './auth/auth.module';
import { FederationModule } from './federation/federation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        },
      }),
      global: true,
    }),
    PrismaModule,
    FederationModule,
    AuthModule,
    UserModule,
    PostModule,
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class AppModule {} 
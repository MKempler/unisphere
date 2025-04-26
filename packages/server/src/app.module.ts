import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerService } from './common/mailer.service';
import { AuthModule } from './auth/auth.module';
import { FederationModule } from './federation/federation.module';
import { SearchModule } from './search/search.module';
import { CircuitModule } from './circuit/circuit.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    FederationModule,
    AuthModule,
    UserModule,
    PostModule,
    SearchModule,
    CircuitModule,
    MediaModule,
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class AppModule {} 
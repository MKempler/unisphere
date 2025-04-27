import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { MailerService } from './common/mailer.service';
import { AuthModule } from './auth/auth.module';
import { FederationModule } from './federation/federation.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { SearchModule } from './search/search.module';
import { MediaModule } from './media/media.module';
import { CircuitModule } from './circuit/circuit.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRY', '1d'),
        },
      }),
    }),
    PrismaModule,
    FederationModule,
    AuthModule,
    UserModule,
    PostModule,
    SearchModule,
    MediaModule,
    CircuitModule,
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class AppModule {} 
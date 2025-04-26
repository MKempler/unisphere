import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Generate JWT secret if not provided
  if (!process.env.JWT_SECRET) {
    const generatedSecret = crypto.randomBytes(32).toString('hex');
    process.env.JWT_SECRET = generatedSecret;
    console.log('Generated JWT_SECRET:', generatedSecret);
    console.log('It is recommended to save this in your .env file for production use.');
  }

  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  app.use(cookieParser());
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Setup CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  
  // Rate limiting middleware - general API
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later',
    }),
  );
  
  // Rate limiting for post creation - 20 posts per 10 minutes
  app.use('/post', 
    rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 20, // limit each IP to 20 post requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many posts created, please try again later',
    }),
  );
  
  // Rate limiting for signup - 50 attempts per hour
  app.use('/auth/signup', 
    rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // limit each IP to 50 signup attempts per hour
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many signup attempts from this IP, please try again later',
    }),
  );
  
  // Set up validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Kavira API')
    .setDescription('Kavira social platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap(); 
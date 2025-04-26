import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { AppModule } from './app.module';

async function bootstrap() {
  // Generate JWT secret if not provided
  if (!process.env.JWT_SECRET) {
    const generatedSecret = crypto.randomBytes(32).toString('hex');
    process.env.JWT_SECRET = generatedSecret;
    console.log('Generated JWT_SECRET:', generatedSecret);
    console.log('It is recommended to save this in your .env file for production use.');
  }

  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors();
  
  // Set up validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('UniSphere API')
    .setDescription('UniSphere social platform API')
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
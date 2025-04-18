import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';
import { join } from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:5000',
    'https://board-api.duckdns.org',
    'https://board-dynamodb.duckdns.org',
  ];

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED') || false;
  const port = configService.get<number>('PORT', 5000);
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.error(`Blocked by CORS: ${origin}`); // Debugging
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Serve public assets (SolidJS build output)
  app.use('/', express.static(path.join(__dirname, '..', 'public/js')));

  // Serve PostgreSQL module documentation
  app.use(
    '/docs/postgres',
    express.static(join(__dirname, '..', 'src/database/postgres/docs')),
  );

  // Set Handlebars as the view engine
  app.setViewEngine('hbs');

  // Set the base directory for views
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  if (NODE_ENV !== 'production' || swaggerEnabled === true) {
    // Swagger Configuration
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Server API')
      .setDescription('API Documentation')
      .setVersion('1.0')
      .addTag('Auth')
      .addBearerAuth() // Enable Authorization Header
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document); // Swagger UI at /api/docs
    console.log('🥞 Swagger is enabled at /docs');
  } else {
    console.log('🚫 Swagger is disabled in production');
  }
  // Graceful shutdown setup
  app.enableShutdownHooks(); // Handle graceful shutdown
  //app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`WebSocket server is running on port: ${port}`);
  logger.log(`Amazon Q namespace: amazon-q`);
}
bootstrap();

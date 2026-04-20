import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================
  // GLOBAL PREFIX (recommended)
  // =========================
  app.setGlobalPrefix('api');

  // =========================
  // SECURITY (optional but recommended)
  // =========================
  app.enableCors({
    origin: '*', // in production: restrict this
    credentials: true,
  });

  // =========================
  // GLOBAL VALIDATION PIPE
  // =========================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // =========================
  // CLASS SERIALIZER (hide @Exclude fields)
  // =========================
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // =========================
  // SWAGGER CONFIG (optimized)
  // =========================
  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('Muhammad Al Xorazmiy Nomidagi Toshkent Axborot Texnologiyalari Universiteti Talabalari Yaratgan API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none', // cleaner UI
      filter: false,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running: http://localhost:${port}/api`);
  console.log(`📘 Swagger UI: http://localhost:${port}/docs`);
}

bootstrap();
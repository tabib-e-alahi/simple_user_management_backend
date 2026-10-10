import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Validation ───────────────────────────────────────────────
  // app.useGlobalPipes(
  //   new ValidationPipe(
  //     {
  //       whitelist: true,
  //       forbidNonWhitelisted: true,
  //       transform: true
  //     }
  //   )
  // )

  const config = new DocumentBuilder()
    .setTitle('Simple User Mangement System')
    .setDescription(
      'This system contains api configuration of user profile management',
    )
    .setVersion("0.1")
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

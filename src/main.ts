import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle("User Mangement Syste,").setDescription("This system contains api configuration of user profile management")
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

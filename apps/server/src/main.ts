import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({ origin: '*' });
  await app.listen(8080);
  console.log('[Server] Listening on http://localhost:8080');
}

bootstrap();

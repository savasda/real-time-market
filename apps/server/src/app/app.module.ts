import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
    }),
    StockModule,
  ],
})
export class AppModule {}

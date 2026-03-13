import { Module } from '@nestjs/common';

import { FinnhubService } from './finnhub.service';
import { StockGateway } from './stock.gateway';
import { StockMetricController } from './stock-metric.controller';

@Module({
  providers: [FinnhubService, StockGateway],
  controllers: [StockMetricController],
})
export class StockModule {}

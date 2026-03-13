import { Controller, Get, InternalServerErrorException, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface MetricResponse {
  metric?: Record<string, number | undefined>;
}

interface Week52Data {
  symbol: string;
  week52High: number;
  week52Low: number;
}

/**
 * Proxies Finnhub REST metric requests so the API token never leaves the server.
 *
 * GET /api/metric/:symbol → { symbol, week52High, week52Low }
 */
@Controller('api')
export class StockMetricController {
  constructor(private readonly config: ConfigService) {}

  @Get('metric/:symbol')
  async getMetric(@Param('symbol') symbol: string): Promise<Week52Data> {
    const token = this.config.getOrThrow<string>('FINNHUB_TOKEN');
    const url = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${token}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new InternalServerErrorException('Finnhub metric request failed');
    }

    const data = (await response.json()) as MetricResponse;

    return {
      symbol,
      week52High: data.metric?.['52WeekHigh'] ?? 0,
      week52Low: data.metric?.['52WeekLow'] ?? 0,
    };
  }
}

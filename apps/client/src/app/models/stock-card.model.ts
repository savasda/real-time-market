import type { StockQuote } from '@stock-app/shared-models';

export enum StockTrend {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral',
}

export interface StockCardViewModel extends StockQuote {
  isEnabled: boolean;
  trend: StockTrend;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

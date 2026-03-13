import type { StockSymbol } from '@stock-app/shared-models';

export interface MockStockState {
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  week52High: number;
  week52Low: number;
}

export type MockStateBySymbol = Record<StockSymbol, MockStockState>;

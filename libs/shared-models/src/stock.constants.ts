export type StockSymbol = 'AAPL' | 'GOOGL' | 'MSFT' | 'TSLA';

export interface StockDefinition {
  symbol: StockSymbol;
  name: string;
}

export const STOCK_DEFINITIONS: readonly StockDefinition[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
] as const;

export const STOCK_SYMBOLS = new Set<StockSymbol>(STOCK_DEFINITIONS.map((stock) => stock.symbol));

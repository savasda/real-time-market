import { STOCK_SYMBOLS, StockSymbol } from './stock.constants';

export enum MessageType {
  Trade = 'trade',
  Stocks = 'stocks',
  Error = 'error',
}

export enum ConnectionStatusType {
  Connecting = 'connecting',
  Retry = 'retry',
  Connected = 'connected',
  Mock = 'mock',
}

export interface StockQuote {
  symbol: StockSymbol;
  name: string;
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  week52High: number;
  week52Low: number;
}

export interface StockUpdateMessage {
  type: MessageType.Stocks;
  data: StockQuote[];
  updatedAt: string;
}

interface StockErrorMessage {
  type: MessageType.Error;
  message: string;
}

export interface ParsedFinnhubTrade {
  symbol: StockSymbol;
  price: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isStockSymbol = (value: unknown): value is StockSymbol =>
  typeof value === 'string' && STOCK_SYMBOLS.has(value as StockSymbol);

const parseStockQuote = (value: unknown): StockQuote | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { symbol, name, currentPrice, dailyHigh, dailyLow, week52High, week52Low } = value;
  if (
    !isStockSymbol(symbol) ||
    typeof name !== 'string' ||
    !isFiniteNumber(currentPrice) ||
    !isFiniteNumber(dailyHigh) ||
    !isFiniteNumber(dailyLow) ||
    !isFiniteNumber(week52High) ||
    !isFiniteNumber(week52Low)
  ) {
    return null;
  }

  return { symbol, name, currentPrice, dailyHigh, dailyLow, week52High, week52Low };
};

export const parseFinnhubTradeMessage = (value: unknown): ParsedFinnhubTrade[] | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { type, data } = value;
  if (type !== MessageType.Trade || !Array.isArray(data)) {
    return null;
  }

  return data.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }
    const { s: symbol, p: price } = entry;
    return isStockSymbol(symbol) && isFiniteNumber(price) ? [{ symbol, price }] : [];
  });
};

export const parseStockUpdateMessage = (value: unknown): StockUpdateMessage | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { type, data, updatedAt } = value;
  if (type !== MessageType.Stocks || !Array.isArray(data) || typeof updatedAt !== 'string') {
    return null;
  }

  const parsedQuotes = data.flatMap((quote) => {
    const parsed = parseStockQuote(quote);
    return parsed ? [parsed] : [];
  });

  if (parsedQuotes.length !== data.length) {
    return null;
  }

  return { type: MessageType.Stocks, data: parsedQuotes, updatedAt };
};

export const parseStockErrorMessage = (value: unknown): StockErrorMessage | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { type, message } = value;
  if (type !== MessageType.Error || typeof message !== 'string') {
    return null;
  }

  return { type: MessageType.Error, message };
};

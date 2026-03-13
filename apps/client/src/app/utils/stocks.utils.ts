import { STOCK_DEFINITIONS, StockQuote, type StockSymbol } from '@stock-app/shared-models';

import { StockCardViewModel, StockTrend } from '../models/stock-card.model';

const INITIAL_NUMERIC_VALUE = 0;

export const createInitialCards = (): StockCardViewModel[] =>
  STOCK_DEFINITIONS.map((definition) => ({
    symbol: definition.symbol,
    name: definition.name,
    currentPrice: INITIAL_NUMERIC_VALUE,
    dailyHigh: INITIAL_NUMERIC_VALUE,
    dailyLow: INITIAL_NUMERIC_VALUE,
    week52High: INITIAL_NUMERIC_VALUE,
    week52Low: INITIAL_NUMERIC_VALUE,
    isEnabled: true,
    trend: StockTrend.Neutral,
    change: 0,
    changePercent: 0,
    lastUpdated: '',
  }));

const getNextTrend = (previousPrice: number, currentPrice: number): StockTrend => {
  if (previousPrice === INITIAL_NUMERIC_VALUE) {
    return StockTrend.Neutral;
  }

  if (currentPrice > previousPrice) {
    return StockTrend.Up;
  }

  if (currentPrice < previousPrice) {
    return StockTrend.Down;
  }

  return StockTrend.Neutral;
};

export const mergeCards = (
  currentCards: StockCardViewModel[],
  incomingQuotes: StockQuote[],
): StockCardViewModel[] => {
  const quoteBySymbol = new Map<StockSymbol, StockQuote>(
    incomingQuotes.map((quote) => [quote.symbol, quote]),
  );

  return currentCards.map((card) => {
    const incoming = quoteBySymbol.get(card.symbol);
    if (!incoming || !card.isEnabled) {
      return card;
    }

    const change = incoming.currentPrice - card.currentPrice;
    const changePercent =
      card.currentPrice === INITIAL_NUMERIC_VALUE ? 0 : (change / card.currentPrice) * 100;

    return {
      ...card,
      ...incoming,
      trend: getNextTrend(card.currentPrice, incoming.currentPrice),
      lastUpdated: formatTime(new Date()),
      change,
      changePercent,
    };
  });
};

export const formatTime = (date: Date): string =>
  date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

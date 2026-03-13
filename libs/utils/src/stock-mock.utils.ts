import { STOCK_DEFINITIONS, type StockQuote, type StockSymbol } from '@stock-app/shared-models';

import type { MockStateBySymbol, MockStockState } from './stock-mock.model';

const baseStateBySymbol: MockStateBySymbol = {
  AAPL: {
    currentPrice: 216.3,
    dailyHigh: 218.5,
    dailyLow: 212.8,
    week52High: 237.2,
    week52Low: 164.1,
  },
  GOOGL: {
    currentPrice: 186.5,
    dailyHigh: 188.2,
    dailyLow: 182.9,
    week52High: 193.3,
    week52Low: 121.5,
  },
  MSFT: {
    currentPrice: 428.4,
    dailyHigh: 432.1,
    dailyLow: 423.8,
    week52High: 468.2,
    week52Low: 309.4,
  },
  TSLA: {
    currentPrice: 248.7,
    dailyHigh: 254.2,
    dailyLow: 242.1,
    week52High: 299.3,
    week52Low: 138.8,
  },
};

const toFixed2 = (value: number): number => Number(value.toFixed(2));

export const createInitialMockState = (): MockStateBySymbol =>
  STOCK_DEFINITIONS.reduce((accumulator, definition) => {
    accumulator[definition.symbol] = { ...baseStateBySymbol[definition.symbol] };
    return accumulator;
  }, {} as MockStateBySymbol);

export const updateMockState = (stateBySymbol: MockStateBySymbol): void => {
  for (const definition of STOCK_DEFINITIONS) {
    const state = stateBySymbol[definition.symbol];
    const delta = getRandomDelta();
    const nextCurrent = Math.max(1, state.currentPrice + delta);

    state.currentPrice = toFixed2(nextCurrent);
    state.dailyHigh = toFixed2(Math.max(state.dailyHigh, state.currentPrice));
    state.dailyLow = toFixed2(Math.min(state.dailyLow, state.currentPrice));
  }
};

export const mapMockStateToQuotes = (stateBySymbol: MockStateBySymbol): StockQuote[] =>
  STOCK_DEFINITIONS.map((definition) => {
    const state = stateBySymbol[definition.symbol];
    return toStockQuote(definition.symbol, definition.name, state);
  });

const getRandomDelta = (): number => {
  const direction = Math.random() > 0.5 ? 1 : -1;
  return direction * Math.random() * 1.5;
};

const toStockQuote = (symbol: StockSymbol, name: string, state: MockStockState): StockQuote => ({
  symbol,
  name,
  currentPrice: state.currentPrice,
  dailyHigh: state.dailyHigh,
  dailyLow: state.dailyLow,
  week52High: state.week52High,
  week52Low: state.week52Low,
});

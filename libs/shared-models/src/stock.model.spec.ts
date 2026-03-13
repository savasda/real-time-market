/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageType,
  type ParsedFinnhubTrade,
  parseFinnhubTradeMessage,
  parseStockErrorMessage,
  parseStockUpdateMessage,
  type StockQuote,
  type StockUpdateMessage,
} from './stock.model';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const VALID_QUOTE: StockQuote = {
  symbol: 'AAPL',
  name: 'Apple',
  currentPrice: 182.5,
  dailyHigh: 185.0,
  dailyLow: 180.0,
  week52High: 200.0,
  week52Low: 130.0,
};

const VALID_STOCK_UPDATE_PAYLOAD = {
  type: MessageType.Stocks,
  data: [VALID_QUOTE],
  updatedAt: '2026-03-14T10:00:00.000Z',
};

const VALID_TRADE_ENTRY = { s: 'AAPL', p: 182.5 };

// ---------------------------------------------------------------------------
// MessageType enum
// ---------------------------------------------------------------------------

describe('MessageType', () => {
  it('should have Trade value of "trade"', () => {
    expect(MessageType.Trade).toBe('trade');
  });

  it('should have Stocks value of "stocks"', () => {
    expect(MessageType.Stocks).toBe('stocks');
  });

  it('should have Error value of "error"', () => {
    expect(MessageType.Error).toBe('error');
  });
});

// ---------------------------------------------------------------------------
// parseFinnhubTradeMessage
// ---------------------------------------------------------------------------

describe('parseFinnhubTradeMessage', () => {
  describe('top-level structure validation', () => {
    it('should return null for null', () => {
      expect(parseFinnhubTradeMessage(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(parseFinnhubTradeMessage(undefined)).toBeNull();
    });

    it('should return null for a number primitive', () => {
      expect(parseFinnhubTradeMessage(42)).toBeNull();
    });

    it('should return null for a string primitive', () => {
      expect(parseFinnhubTradeMessage('trade')).toBeNull();
    });

    it('should return null for a boolean primitive', () => {
      expect(parseFinnhubTradeMessage(true)).toBeNull();
    });

    it('should return null for an array at the top level', () => {
      expect(parseFinnhubTradeMessage([VALID_TRADE_ENTRY])).toBeNull();
    });

    it('should return null for an empty object', () => {
      expect(parseFinnhubTradeMessage({})).toBeNull();
    });

    it('should return null when type is missing', () => {
      expect(parseFinnhubTradeMessage({ data: [VALID_TRADE_ENTRY] })).toBeNull();
    });

    it('should return null when type is "stocks" instead of "trade"', () => {
      expect(
        parseFinnhubTradeMessage({ type: MessageType.Stocks, data: [VALID_TRADE_ENTRY] }),
      ).toBeNull();
    });

    it('should return null when type is "error" instead of "trade"', () => {
      expect(
        parseFinnhubTradeMessage({ type: MessageType.Error, data: [VALID_TRADE_ENTRY] }),
      ).toBeNull();
    });

    it('should return null when type is a non-matching string', () => {
      expect(parseFinnhubTradeMessage({ type: 'ping', data: [VALID_TRADE_ENTRY] })).toBeNull();
    });

    it('should return null when type is correct but data is missing', () => {
      expect(parseFinnhubTradeMessage({ type: MessageType.Trade })).toBeNull();
    });

    it('should return null when data is not an array (object)', () => {
      expect(parseFinnhubTradeMessage({ type: MessageType.Trade, data: {} })).toBeNull();
    });

    it('should return null when data is not an array (string)', () => {
      expect(parseFinnhubTradeMessage({ type: MessageType.Trade, data: 'AAPL' })).toBeNull();
    });

    it('should return null when data is not an array (number)', () => {
      expect(parseFinnhubTradeMessage({ type: MessageType.Trade, data: 1 })).toBeNull();
    });
  });

  describe('valid inputs', () => {
    it('should return an array with a single valid trade', () => {
      const result = parseFinnhubTradeMessage({
        type: MessageType.Trade,
        data: [VALID_TRADE_ENTRY],
      });

      expect(result).toEqual([{ symbol: 'AAPL', price: 182.5 }] as ParsedFinnhubTrade[]);
    });

    it('should return trades for all supported symbols', () => {
      const data = [
        { s: 'AAPL', p: 100 },
        { s: 'GOOGL', p: 200 },
        { s: 'MSFT', p: 300 },
        { s: 'TSLA', p: 400 },
      ];
      const result = parseFinnhubTradeMessage({ type: MessageType.Trade, data });

      expect(result).toEqual([
        { symbol: 'AAPL', price: 100 },
        { symbol: 'GOOGL', price: 200 },
        { symbol: 'MSFT', price: 300 },
        { symbol: 'TSLA', price: 400 },
      ] as ParsedFinnhubTrade[]);
    });

    it('should return an empty array when data array is empty', () => {
      const result = parseFinnhubTradeMessage({ type: MessageType.Trade, data: [] });

      expect(result).toEqual([]);
    });
  });

  describe('entry-level filtering (invalid entries are dropped)', () => {
    it('should filter out entries with an invalid (non-supported) symbol', () => {
      const data = [{ s: 'AMZN', p: 150 }, VALID_TRADE_ENTRY];
      const result = parseFinnhubTradeMessage({ type: MessageType.Trade, data });

      expect(result).toEqual([{ symbol: 'AAPL', price: 182.5 }]);
    });

    it('should return only valid entries from a mixed array', () => {
      const data = [
        { s: 'AAPL', p: 100 },
        { s: 'AMZN', p: 50 },
        { s: 'MSFT', p: NaN },
        { s: 'GOOGL', p: 200 },
      ];
      const result = parseFinnhubTradeMessage({ type: MessageType.Trade, data });

      expect(result).toEqual([
        { symbol: 'AAPL', price: 100 },
        { symbol: 'GOOGL', price: 200 },
      ]);
    });
  });
});

// ---------------------------------------------------------------------------
// parseStockUpdateMessage
// ---------------------------------------------------------------------------

describe('parseStockUpdateMessage', () => {
  describe('valid inputs', () => {
    it('should return a parsed StockUpdateMessage for a valid payload', () => {
      const result = parseStockUpdateMessage(VALID_STOCK_UPDATE_PAYLOAD);

      expect(result).toEqual({
        type: MessageType.Stocks,
        data: [VALID_QUOTE],
        updatedAt: '2026-03-14T10:00:00.000Z',
      } as StockUpdateMessage);
    });

    it('should return null when type is wrong', () => {
      expect(
        parseStockUpdateMessage({ type: MessageType.Trade, data: [VALID_QUOTE], updatedAt: 'ts' }),
      ).toBeNull();
    });

    it('should return null when one quote has an invalid symbol', () => {
      const badQuote = { ...VALID_QUOTE, symbol: 'AMZN' };
      expect(
        parseStockUpdateMessage({ type: MessageType.Stocks, data: [VALID_QUOTE, badQuote], updatedAt: 'now' }),
      ).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// parseStockErrorMessage
// ---------------------------------------------------------------------------

describe('parseStockErrorMessage', () => {
  it('should return a parsed StockErrorMessage for a valid payload', () => {
    const result = parseStockErrorMessage({ type: MessageType.Error, message: 'Connection lost' });

    expect(result).toEqual({ type: MessageType.Error, message: 'Connection lost' });
  });

  it('should return null for null', () => {
    expect(parseStockErrorMessage(null)).toBeNull();
  });

  it('should return null when message is missing', () => {
    expect(parseStockErrorMessage({ type: MessageType.Error })).toBeNull();
  });
});

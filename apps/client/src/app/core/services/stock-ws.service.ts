import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay, switchMap } from 'rxjs';

import {
  STOCK_DEFINITIONS,
  StockSymbol,
  ParsedFinnhubTrade,
  parseFinnhubTradeMessage,
  StockQuote,
} from '@stock-app/shared-models';

import { StockQuoteService, type Week52Data } from './stock-quote.service';
import { FINNHUB_WS_URL } from '../tokens';

@Injectable({ providedIn: 'root' })
export class StockWsService {
  private readonly wsUrl = inject(FINNHUB_WS_URL);
  private readonly stockQuoteService = inject(StockQuoteService);

  private readonly week52Data$ = this.stockQuoteService.fetchAll52WeekData().pipe(shareReplay(1));

  streamStocks(activeSymbols$: Observable<StockSymbol[]>): Observable<StockQuote[]> {
    return this.week52Data$.pipe(
      switchMap((week52Map) => this.createWsStream(activeSymbols$, week52Map)),
    );
  }

  private createWsStream(
    activeSymbols$: Observable<StockSymbol[]>,
    week52Map: Map<StockSymbol, Week52Data>,
  ): Observable<StockQuote[]> {
    return new Observable<StockQuote[]>((observer) => {
      if (typeof window === 'undefined') {
        observer.error(new Error('WebSocket is not available during SSR'));
        return undefined;
      }
      const socket = new WebSocket(this.wsUrl);
      const stateBySymbol = this.createStateBySymbol(week52Map);
      const currentSubscriptions = new Set<StockSymbol>();
      let lastSymbols: StockSymbol[] = [];

      const syncSubscriptions = (nextSymbols: StockSymbol[]) => {
        if (socket.readyState !== WebSocket.OPEN) {
          return;
        }

        const nextSet = new Set(nextSymbols);

        for (const symbol of currentSubscriptions) {
          if (!nextSet.has(symbol)) {
            socket.send(JSON.stringify({ event: 'unsubscribe', data: { symbol } }));
            currentSubscriptions.delete(symbol);
          }
        }

        for (const symbol of nextSymbols) {
          if (!currentSubscriptions.has(symbol)) {
            socket.send(JSON.stringify({ event: 'subscribe', data: { symbol } }));
            currentSubscriptions.add(symbol);
          }
        }
      };

      const activeSymbolsSub = activeSymbols$.subscribe((symbols) => {
        lastSymbols = symbols;
        syncSubscriptions(symbols);
      });

      socket.onmessage = (event: MessageEvent<string>) => {
        let payload: unknown;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }

        const trades = parseFinnhubTradeMessage(payload);
        if (trades === null || trades.length === 0) {
          return;
        }

        this.applyTradesToState(stateBySymbol, trades);
        observer.next(this.toOrderedQuotes(stateBySymbol));
      };

      socket.onopen = () => {
        syncSubscriptions(lastSymbols);
        observer.next([]); // signals that connection is established
      };

      socket.onerror = () => {
        observer.error(new Error('Unable to connect to Finnhub websocket stream'));
      };

      socket.onclose = () => {
        observer.error(new Error('Finnhub websocket stream closed'));
      };

      return () => {
        activeSymbolsSub.unsubscribe();
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };
    });
  }

  private createStateBySymbol(
    week52Map: Map<StockSymbol, Week52Data>,
  ): Map<StockSymbol, StockQuote> {
    return new Map<StockSymbol, StockQuote>(
      STOCK_DEFINITIONS.map(({ symbol, name }) => {
        const week52 = week52Map.get(symbol);
        return [
          symbol,
          {
            symbol,
            name,
            currentPrice: 0,
            dailyHigh: 0,
            dailyLow: 0,
            week52High: week52?.week52High ?? 0,
            week52Low: week52?.week52Low ?? 0,
          },
        ];
      }),
    );
  }

  private applyTradesToState(
    stateBySymbol: Map<StockSymbol, StockQuote>,
    trades: ParsedFinnhubTrade[],
  ): void {
    for (const trade of trades) {
      const current = stateBySymbol.get(trade.symbol);
      if (!current) {
        continue;
      }

      const nextPrice = this.toFixed2(trade.price);
      const isFirst = current.currentPrice === 0;
      stateBySymbol.set(trade.symbol, {
        ...current,
        currentPrice: nextPrice,
        dailyHigh: isFirst ? nextPrice : this.toFixed2(Math.max(current.dailyHigh, nextPrice)),
        dailyLow: isFirst ? nextPrice : this.toFixed2(Math.min(current.dailyLow, nextPrice)),
      });
    }
  }

  private toOrderedQuotes(stateBySymbol: Map<StockSymbol, StockQuote>): StockQuote[] {
    return STOCK_DEFINITIONS.map((definition) => stateBySymbol.get(definition.symbol)).filter(
      (quote): quote is StockQuote => quote !== undefined,
    );
  }

  private toFixed2(value: number): number {
    return Number(value.toFixed(2));
  }
}

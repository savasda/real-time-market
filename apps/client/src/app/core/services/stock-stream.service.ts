import { inject, Injectable, signal } from '@angular/core';
import { catchError, filter, type Observable, share, timer } from 'rxjs';
import { retry, tap } from 'rxjs/operators';

import { ConnectionStatusType, StockQuote, StockSymbol } from '@stock-app/shared-models';

import { StockMockService } from './stock-mock.service';
import { StockWsService } from './stock-ws.service';

export type ConnectionStatus =
  | { type: ConnectionStatusType.Connecting; attempt: number }
  | { type: ConnectionStatusType.Retry; attempt: number; max: number }
  | { type: ConnectionStatusType.Connected }
  | { type: ConnectionStatusType.Mock };

const MAX_RETRIES = 3;

@Injectable({ providedIn: 'root' })
export class StockStreamService {
  private readonly stockWsService = inject(StockWsService);
  private readonly stockMockService = inject(StockMockService);

  private readonly statusSignal = signal<ConnectionStatus>({
    type: ConnectionStatusType.Connecting,
    attempt: 1,
  });
  readonly status = this.statusSignal.asReadonly();

  streamStocks(activeSymbols$: Observable<StockSymbol[]>): Observable<StockQuote[]> {
    if (typeof window === 'undefined') {
      return this.stockMockService.streamStocks();
    }

    this.statusSignal.set({ type: ConnectionStatusType.Connecting, attempt: 1 });

    const real$ = this.stockWsService.streamStocks(activeSymbols$).pipe(
      tap((quotes) => {
        if (quotes.length === 0) {
          this.statusSignal.set({ type: ConnectionStatusType.Connected });
        }
      }),
      filter((quotes) => quotes.length > 0),
      retry({
        count: MAX_RETRIES,
        delay: (_, retryCount) => {
          this.statusSignal.set({
            type: ConnectionStatusType.Retry,
            attempt: retryCount + 1,
            max: MAX_RETRIES + 1,
          });
          return timer(5000);
        },
      }),
      share(),
    );

    const mock$ = this.stockMockService.streamStocks();

    return real$.pipe(
      catchError(() => {
        this.statusSignal.set({ type: ConnectionStatusType.Mock });
        return mock$;
      }),
    );
  }
}

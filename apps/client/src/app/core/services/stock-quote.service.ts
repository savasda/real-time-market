import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, type Observable, of } from 'rxjs';

import { STOCK_DEFINITIONS, type StockSymbol } from '@stock-app/shared-models';

import { SERVER_URL } from '../tokens';

export interface Week52Data {
  symbol: StockSymbol;
  week52High: number;
  week52Low: number;
}

@Injectable({ providedIn: 'root' })
export class StockQuoteService {
  private readonly http = inject(HttpClient);
  private readonly serverUrl = inject(SERVER_URL);

  fetchAll52WeekData(): Observable<Map<StockSymbol, Week52Data>> {
    const requests = STOCK_DEFINITIONS.map(({ symbol }) =>
      this.http.get<Week52Data>(`${this.serverUrl}/api/metric/${symbol}`).pipe(
        catchError(() => of({ symbol, week52High: 0, week52Low: 0 })),
      ),
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const dataMap = new Map<StockSymbol, Week52Data>();
        for (const result of results) {
          dataMap.set(result.symbol, result);
        }
        return dataMap;
      }),
    );
  }
}

import { Injectable } from '@angular/core';
import { interval, map, type Observable, startWith } from 'rxjs';

import { StockQuote } from '@stock-app/shared-models';
import { createInitialMockState, mapMockStateToQuotes, updateMockState } from '@stock-app/utils';

@Injectable({ providedIn: 'root' })
export class StockMockService {
  streamStocks(): Observable<StockQuote[]> {
    const currentState = createInitialMockState();

    return interval(1500).pipe(
      startWith(0),
      map(() => {
        updateMockState(currentState);
        return mapMockStateToQuotes(currentState);
      }),
    );
  }
}

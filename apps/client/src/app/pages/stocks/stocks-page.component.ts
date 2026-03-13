import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { ConnectionStatusType, StockQuote, StockSymbol } from '@stock-app/shared-models';

import { StockCardComponent } from '../../components/stock-card/stock-card.component';
import { StockTrend } from '../../models/stock-card.model';
import { StockStreamService } from '../../core/services/stock-stream.service';
import { createInitialCards, mergeCards } from '../../utils/stocks.utils';

const MOCK_NOTICE_DURATION_MS = 2500;

@Component({
  selector: 'app-stocks-page',
  imports: [StockCardComponent],
  templateUrl: './stocks-page.component.html',
  styleUrl: './stocks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StocksPageComponent implements OnInit {
  private readonly stockStreamService = inject(StockStreamService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cards = signal(createInitialCards());
  protected readonly activeSymbols = computed(() =>
    this.cards()
      .filter((card) => card.isEnabled)
      .map((card) => card.symbol),
  );

  protected readonly hasAnyActiveCard = computed(() => this.activeSymbols().length > 0);
  protected readonly isLoading = signal(true);
  protected readonly streamStatus = this.stockStreamService.status;

  protected readonly loaderMessage = computed(() => {
    const status = this.streamStatus();
    switch (status.type) {
      case ConnectionStatusType.Connecting:
        return `Connecting to server... (attempt ${status.attempt})`;
      case ConnectionStatusType.Retry:
        return `Connection failed. Retrying... (attempt ${status.attempt} of ${status.max})`;
      case ConnectionStatusType.Mock:
        return 'Real server unavailable. Switching to mock data.';
      case ConnectionStatusType.Connected:
        return 'Connected.';
    }
  });

  constructor() {
    effect(() => {
      const status = this.streamStatus();
      if (
        status.type === ConnectionStatusType.Retry ||
        status.type === ConnectionStatusType.Connecting
      ) {
        this.isLoading.set(true);
      } else if (status.type === ConnectionStatusType.Connected) {
        this.isLoading.set(false);
      } else if (status.type === ConnectionStatusType.Mock) {
        this.isLoading.set(true);
        setTimeout(() => this.isLoading.set(false), MOCK_NOTICE_DURATION_MS);
      }
    });
  }

  ngOnInit(): void {
    this.stockStreamService
      .streamStocks(toObservable(this.activeSymbols, { injector: this.injector }))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((quotes: StockQuote[]) => {
        this.cards.update((currentCards) => mergeCards(currentCards, quotes));
      });
  }

  protected toggleCard(symbol: StockSymbol): void {
    this.cards.update((cards) =>
      cards.map((card) => {
        if (card.symbol !== symbol) {
          return card;
        }

        const nextIsEnabled = !card.isEnabled;

        return {
          ...card,
          isEnabled: nextIsEnabled,
          trend: nextIsEnabled ? StockTrend.Neutral : card.trend,
        };
      }),
    );
  }
}

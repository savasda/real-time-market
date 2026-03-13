import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { type StockSymbol } from '@stock-app/shared-models';
import { StockToggleComponent } from '@stock-app/ui';

import { StockCardViewModel, StockTrend } from '../../models/stock-card.model';

@Component({
  selector: 'app-stock-card',
  imports: [DecimalPipe, ReactiveFormsModule, StockToggleComponent],
  templateUrl: './stock-card.component.html',
  styleUrl: './stock-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockCardComponent {
  private readonly injector = inject(Injector);
  protected readonly stockTrend = StockTrend;
  readonly card = input.required<StockCardViewModel>();
  readonly toggled = output<StockSymbol>();
  protected readonly toggleControl = new FormControl<boolean>(false);
  private readonly toggleValue = toSignal(this.toggleControl.valueChanges, {
    injector: this.injector,
    initialValue: this.toggleControl.value,
  });

  constructor() {
    effect(() => {
      const isEnabled = this.card().isEnabled;
      this.toggleControl.setValue(isEnabled);
    });

    effect(() => {
      const value = this.toggleValue();
      if (value !== this.card().isEnabled) {
        this.toggled.emit(this.card().symbol);
      }
    });
  }
}

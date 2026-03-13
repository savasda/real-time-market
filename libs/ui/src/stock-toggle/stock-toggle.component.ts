import { ChangeDetectionStrategy, Component, forwardRef, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-stock-toggle',
  standalone: true,
  templateUrl: './stock-toggle.component.html',
  styleUrls: ['./stock-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StockToggleComponent),
      multi: true,
    },
  ],
})
export class StockToggleComponent implements ControlValueAccessor {
  readonly labelOn = input<string>('ON');
  readonly labelOff = input<string>('OFF');
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<boolean>();

  value = false;
  private disabledState = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  get isDisabled(): boolean {
    return this.disabled() || this.disabledState;
  }

  writeValue(value: boolean): void {
    this.value = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState = isDisabled;
  }

  toggle(): void {
    if (this.isDisabled) {
      return;
    }

    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }
}

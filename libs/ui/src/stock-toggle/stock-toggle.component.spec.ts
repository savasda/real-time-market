import { TestBed } from '@angular/core/testing';

import { StockToggleComponent } from './stock-toggle.component';

describe('StockToggleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockToggleComponent],
    }).compileComponents();
  });

  it('should place the slider on the left when value is false', () => {
    const fixture = TestBed.createComponent(StockToggleComponent);
    const component = fixture.componentInstance;

    component.value = false;
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector('.stock-toggle__slider');
    const computed = getComputedStyle(slider);

    expect(computed.order).toBe('0');
  });

  it('should place the slider on the right when value is true', () => {
    const fixture = TestBed.createComponent(StockToggleComponent);
    const component = fixture.componentInstance;

    component.value = true;
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector('.stock-toggle__slider');
    const computed = getComputedStyle(slider);

    expect(computed.order).toBe('2');
  });
});

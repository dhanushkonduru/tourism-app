import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BookingCarouselComponent } from './booking-carousel.component';

describe('BookingCarouselComponent', () => {
  let component: BookingCarouselComponent;
  let fixture: ComponentFixture<BookingCarouselComponent>;

  const images = [
    { src: 'https://images.unsplash.com/photo-1', alt: 'Slide 1', caption: 'One' },
    { src: 'https://images.unsplash.com/photo-2', alt: 'Slide 2', caption: 'Two' },
    { src: 'https://images.unsplash.com/photo-3', alt: 'Slide 3', caption: 'Three' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCarouselComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingCarouselComponent);
    component = fixture.componentInstance;
    component.images = images;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: '(pointer: coarse)',
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
      } as MediaQueryList)
    });
  });

  it('should autoplay when not paused', () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    expect(component.activeIndex).toBe(0);
    vi.advanceTimersByTime(component.intervalMs + 20);
    expect(component.activeIndex).toBe(1);

    vi.useRealTimers();
  });

  it('should pause autoplay on hover', () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    component.onHoverPause();
    vi.advanceTimersByTime(component.intervalMs + 20);
    expect(component.activeIndex).toBe(0);

    vi.useRealTimers();
  });

  it('should navigate to clicked thumbnail', () => {
    fixture.detectChanges();
    const thumbButtons = fixture.nativeElement.querySelectorAll('.thumb');
    thumbButtons[2].click();
    fixture.detectChanges();

    expect(component.activeIndex).toBe(2);
  });

  it('should support keyboard navigation', () => {
    fixture.detectChanges();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(component.activeIndex).toBe(1);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(component.activeIndex).toBe(0);
  });

  it('should set lazy loading on main image', () => {
    fixture.detectChanges();
    const mainImage: HTMLImageElement = fixture.nativeElement.querySelector('.carousel-main img');
    expect(mainImage.getAttribute('loading')).toBe('lazy');
  });
});

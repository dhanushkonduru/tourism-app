import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

export interface CarouselImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface NormalizedCarouselImage {
  src: string;
  alt: string;
  caption: string;
}

@Component({
  selector: 'app-booking-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-carousel.component.html',
  styleUrls: ['./booking-carousel.component.scss']
})
export class BookingCarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() images: CarouselImage[] = [];
  @Input() intervalMs = 5000;

  allImages: NormalizedCarouselImage[] = [];
  visibleImages: NormalizedCarouselImage[] = [];
  activeIndex = 0;
  liveAnnouncement = '';

  isTouchViewport = false;
  isInteractionPaused = false;
  isExplicitlyPaused = false;
  isModalOpen = false;

  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;

  ngOnInit(): void {
    this.detectViewportMode();
    this.rebuildImages();
    this.updateAnnouncement();
    this.syncAutoplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images']) {
      this.rebuildImages();
      this.updateAnnouncement();
      this.syncAutoplay();
    }

    if (changes['intervalMs'] && !changes['intervalMs'].firstChange) {
      this.syncAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  get showGalleryLink(): boolean {
    return this.allImages.length > this.visibleImages.length;
  }

  get canAutoplay(): boolean {
    return !this.isTouchViewport && this.visibleImages.length > 1;
  }

  get isPlaying(): boolean {
    return this.canAutoplay && !this.isInteractionPaused && !this.isExplicitlyPaused;
  }

  trackByIndex(index: number): number {
    return index;
  }

  prevSlide(): void {
    const slideCount = this.currentSlideCount;

    if (slideCount <= 1) {
      return;
    }

    this.activeIndex = (this.activeIndex - 1 + slideCount) % slideCount;
    this.updateAnnouncement();
  }

  nextSlide(): void {
    const slideCount = this.currentSlideCount;

    if (slideCount <= 1) {
      return;
    }

    this.activeIndex = (this.activeIndex + 1) % slideCount;
    this.updateAnnouncement();
  }

  goToSlide(index: number): void {
    if (index < 0 || index >= this.currentSlideCount) {
      return;
    }

    this.activeIndex = index;
    this.updateAnnouncement();
  }

  pauseByUser(): void {
    this.isExplicitlyPaused = true;
    this.syncAutoplay();
  }

  resumeByUser(): void {
    this.isExplicitlyPaused = false;
    this.syncAutoplay();
  }

  onHoverPause(): void {
    this.isInteractionPaused = true;
    this.syncAutoplay();
  }

  onHoverResume(): void {
    this.isInteractionPaused = false;
    this.syncAutoplay();
  }

  onTouchStart(): void {
    this.isInteractionPaused = true;
    this.syncAutoplay();
  }

  onTouchSwipeStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0]?.clientX ?? 0;
  }

  onTouchSwipeEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0]?.clientX ?? this.touchStartX;
    const deltaX = endX - this.touchStartX;

    if (Math.abs(deltaX) < 30) {
      return;
    }

    if (deltaX < 0) {
      this.nextSlide();
    } else {
      this.prevSlide();
    }
  }

  openModal(): void {
    this.isModalOpen = true;

    if (this.activeIndex >= this.allImages.length) {
      this.activeIndex = 0;
    }

    this.onHoverPause();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.onHoverResume();
  }

  getMainSrcSet(): string {
    const image = this.currentImages[this.activeIndex];
    return image ? this.buildSrcSet(image.src) : '';
  }

  getThumbSrcSet(src: string): string {
    return this.buildSrcSet(src);
  }

  getImageSrc(src: string): string {
    if (src.startsWith('query:')) {
      const query = src.slice('query:'.length);
      return this.getImageUrl(query, this.activeIndex + 1);
    }

    return src;
  }

  onMainImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = this.getPlaceholderDataUri('Image unavailable');
  }

  onThumbnailError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = this.getPlaceholderDataUri('Preview unavailable');
  }

  @HostListener('window:resize')
  onResize(): void {
    const previousMode = this.isTouchViewport;
    this.detectViewportMode();

    if (previousMode !== this.isTouchViewport) {
      this.syncAutoplay();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prevSlide();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextSlide();
      return;
    }

    if (event.key === 'Escape' && this.isModalOpen) {
      this.closeModal();
    }
  }

  private rebuildImages(): void {
    const normalized = this.images
      .filter((image) => !!image?.src)
      .map((image, index) => ({
        src: image.src,
        alt: image.alt?.trim() || `Destination image ${index + 1}`,
        caption: image.caption?.trim() || `Photo ${index + 1}`
      }));

    this.allImages = normalized;
    this.visibleImages = normalized.slice(0, 5);

    if (this.visibleImages.length === 0) {
      this.visibleImages = [
        {
          src: this.getPlaceholderDataUri('No preview available'),
          alt: 'No preview available',
          caption: 'No preview available'
        }
      ];
    }

    if (this.activeIndex >= this.visibleImages.length) {
      this.activeIndex = 0;
    }
  }

  private syncAutoplay(): void {
    if (!this.isPlaying) {
      this.stopAutoplay();
      return;
    }

    this.startAutoplay();
  }

  private startAutoplay(): void {
    if (this.autoplayTimer) {
      return;
    }

    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.intervalMs);
  }

  private stopAutoplay(): void {
    if (!this.autoplayTimer) {
      return;
    }

    clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
  }

  private detectViewportMode(): void {
    const hasCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    const hasTouchEvents = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
    this.isTouchViewport = hasCoarsePointer || hasTouchEvents;
  }

  private updateAnnouncement(): void {
    const image = this.currentImages[this.activeIndex];
    if (!image) {
      this.liveAnnouncement = '';
      return;
    }

    this.liveAnnouncement = `Slide ${this.activeIndex + 1} of ${this.currentImages.length}: ${image.caption}`;
  }

  private get currentImages(): NormalizedCarouselImage[] {
    return this.isModalOpen ? this.allImages : this.visibleImages;
  }

  private get currentSlideCount(): number {
    return this.currentImages.length;
  }

  private getImageUrl(query: string, id: number): string {
    const cleanQuery = encodeURIComponent(query.trim() || 'travel destination');
    return `https://source.unsplash.com/1600x1000/?${cleanQuery}&sig=${id}`;
  }

  private buildSrcSet(src: string): string {
    const imageSrc = src.startsWith('query:') ? this.getImageUrl(src.slice('query:'.length), this.activeIndex + 1) : src;

    if (!imageSrc.includes('unsplash.com') || imageSrc.includes('source.unsplash.com')) {
      return '';
    }

    const separator = imageSrc.includes('?') ? '&' : '?';
    return `${imageSrc}${separator}w=640 640w, ${imageSrc}${separator}w=960 960w, ${imageSrc}${separator}w=1280 1280w`;
  }

  private getPlaceholderDataUri(message: string): string {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000'><rect width='100%' height='100%' fill='%23151720'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23d9a6b9' font-size='34' font-family='Arial, sans-serif'>${message}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

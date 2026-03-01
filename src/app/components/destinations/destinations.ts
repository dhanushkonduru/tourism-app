import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Destination, DestinationFilterState, SortOption, TravelType } from '../../models/destination.model';
import { DestinationService } from '../../services/destination.service';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './destinations.html',
  styleUrls: ['./destinations.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DestinationsComponent implements OnInit, OnDestroy {
  destinations: Destination[] = [];
  pagedDestinations: Destination[] = [];
  totalCount = 0;
  filteredCount = 0;

  isFiltering = false;

  sortBy: SortOption = 'popularity';
  searchTerm = '';
  travelType: TravelType = 'all';
  maxBudget = 5000;
  region = 'all';
  pageSize = 12;
  currentPage = 1;
  totalPages = 1;

  // Hero background slideshow
  readonly heroImages = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=800&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&h=800&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920&h=800&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=800&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&h=800&fit=crop&auto=format&q=75'
  ];
  currentHeroIndex = 0;

  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&auto=format';

  readonly travelTypes: TravelType[];
  readonly regions: string[];
  readonly maxBudgetLimit: number;

  private readonly subscriptions = new Subscription();
  private animationTimer: ReturnType<typeof setTimeout> | null = null;
  private heroTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly destinationService: DestinationService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.travelTypes = this.destinationService.travelTypes;
    this.regions = this.destinationService.regions;
    this.maxBudgetLimit = this.destinationService.maxBudgetLimit;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.destinationService.filteredDestinations$.subscribe((destinations) => {
        this.destinations = destinations;
        this.updatePagination();
      })
    );

    this.subscriptions.add(
      this.destinationService.totalCount$.subscribe((count) => {
        this.totalCount = count;
      })
    );

    this.subscriptions.add(
      this.destinationService.filteredCount$.subscribe((count) => {
        this.filteredCount = count;
      })
    );

    this.subscriptions.add(
      this.destinationService.filterState$.subscribe((state: DestinationFilterState) => {
        this.sortBy = state.sortBy;
        this.searchTerm = state.searchTerm;
        this.travelType = state.travelType;
        this.maxBudget = state.maxBudget;
        this.region = state.region;
      })
    );

    // Start hero image rotation
    this.heroTimer = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
      this.cdr.markForCheck();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
    this.subscriptions.unsubscribe();
  }

  onSortChange(value: SortOption): void {
    this.currentPage = 1;
    this.destinationService.setSortBy(value);
    this.triggerFilterAnimation();
  }

  onTravelTypeChange(value: TravelType): void {
    this.currentPage = 1;
    this.destinationService.setTravelType(value);
    this.triggerFilterAnimation();
  }

  onBudgetChange(value: number): void {
    this.currentPage = 1;
    this.destinationService.setMaxBudget(Number(value));
    this.triggerFilterAnimation();
  }

  onRegionChange(value: string): void {
    this.currentPage = 1;
    this.destinationService.setRegion(value);
    this.triggerFilterAnimation();
  }

  onSearchChange(value: string): void {
    this.currentPage = 1;
    this.destinationService.setSearchTerm(value);
    this.triggerFilterAnimation();
  }

  resetFilters(): void {
    this.currentPage = 1;
    this.destinationService.resetFilters();
    this.triggerFilterAnimation();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();
    this.triggerFilterAnimation();
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.dataset['fallbackApplied'] === 'true') {
      return;
    }

    image.dataset['fallbackApplied'] = 'true';
    image.src = this.fallbackImage;
  }

  get visiblePageNumbers(): number[] {
    const maxVisibleButtons = 5;
    const half = Math.floor(maxVisibleButtons / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisibleButtons - 1);

    if (end - start < maxVisibleButtons - 1) {
      start = Math.max(1, end - maxVisibleButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get currentResultsCount(): number {
    return this.pagedDestinations.length;
  }

  trackByDestination(_: number, destination: Destination): number {
    return destination.id;
  }

  getTravelTypeLabel(type: TravelType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.destinations.length / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedDestinations = this.destinations.slice(startIndex, startIndex + this.pageSize);
  }

  private triggerFilterAnimation(): void {
    this.isFiltering = true;

    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }

    this.animationTimer = setTimeout(() => {
      this.isFiltering = false;
      this.cdr.markForCheck();
    }, 220);
  }
}

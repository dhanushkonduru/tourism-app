import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';

import { INTERNATIONAL_DESTINATIONS } from '../data/international-destinations.data';
import { Destination, DestinationFilterState, SortOption, TravelType } from '../models/destination.model';
import { applyDestinationFilters } from '../shared/destination-query.utils';

const DEFAULT_FILTER_STATE: DestinationFilterState = {
  sortBy: 'popularity',
  searchTerm: '',
  travelType: 'all',
  maxBudget: 5000,
  region: 'all'
};

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private readonly destinationsSubject = new BehaviorSubject<Destination[]>(INTERNATIONAL_DESTINATIONS);

  private readonly filterStateSubject = new BehaviorSubject<DestinationFilterState>(DEFAULT_FILTER_STATE);

  readonly destinations$ = this.destinationsSubject.asObservable();
  readonly filterState$ = this.filterStateSubject.asObservable();

  readonly filteredDestinations$ = combineLatest([this.destinations$, this.filterState$]).pipe(
    map(([destinations, filterState]) => applyDestinationFilters(destinations, filterState)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly totalCount$ = this.destinations$.pipe(map((destinations) => destinations.length));
  readonly filteredCount$ = this.filteredDestinations$.pipe(map((destinations) => destinations.length));

  readonly travelTypes: TravelType[] = ['all', 'luxury', 'adventure', 'family', 'honeymoon', 'cultural', 'nature'];
  readonly regions: string[] = ['all', 'europe', 'asia', 'north-america', 'south-america', 'africa', 'oceania'];
  readonly maxBudgetLimit = 5500;

  getDestinationById(identifier: string): Destination | undefined {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    return this.destinationsSubject.value.find(
      (destination) => destination.destinationId === normalizedIdentifier || String(destination.id) === normalizedIdentifier
    );
  }

  updateFilters(partialState: Partial<DestinationFilterState>): void {
    this.filterStateSubject.next({
      ...this.filterStateSubject.value,
      ...partialState
    });
  }

  setSortBy(sortBy: SortOption): void {
    this.updateFilters({ sortBy });
  }

  setTravelType(travelType: TravelType): void {
    this.updateFilters({ travelType });
  }

  setMaxBudget(maxBudget: number): void {
    this.updateFilters({ maxBudget });
  }

  setRegion(region: string): void {
    this.updateFilters({ region });
  }

  setSearchTerm(searchTerm: string): void {
    this.updateFilters({ searchTerm });
  }

  resetFilters(): void {
    this.filterStateSubject.next(DEFAULT_FILTER_STATE);
  }
}

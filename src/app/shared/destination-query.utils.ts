import { Destination, DestinationFilterState, SortOption } from '../models/destination.model';

export function filterDestinations(destinations: Destination[], filters: DestinationFilterState): Destination[] {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase();
  const normalizedRegion = filters.region.toLowerCase();

  return destinations.filter((destination) => {
    const matchesType =
      filters.travelType === 'all' ||
      destination.tags.some((tag) => tag.toLowerCase() === filters.travelType.toLowerCase());

    const matchesBudget = destination.priceFrom <= filters.maxBudget;

    const matchesRegion = normalizedRegion === 'all' || destination.region.toLowerCase() === normalizedRegion;

    const matchesSearch =
      normalizedSearch.length === 0 ||
      destination.name.toLowerCase().includes(normalizedSearch) ||
      destination.country.toLowerCase().includes(normalizedSearch);

    return matchesType && matchesBudget && matchesRegion && matchesSearch;
  });
}

export function sortDestinations(destinations: Destination[], sortBy: SortOption): Destination[] {
  const copied = [...destinations];

  switch (sortBy) {
    case 'price-asc':
      return copied.sort((a, b) => a.priceFrom - b.priceFrom);
    case 'price-desc':
      return copied.sort((a, b) => b.priceFrom - a.priceFrom);
    case 'rating-desc':
      return copied.sort((a, b) => b.rating - a.rating);
    case 'popularity':
    default:
      return copied.sort((a, b) => b.popularity - a.popularity);
  }
}

export function applyDestinationFilters(destinations: Destination[], filters: DestinationFilterState): Destination[] {
  return sortDestinations(filterDestinations(destinations, filters), filters.sortBy);
}

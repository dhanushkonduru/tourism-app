export type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'rating-desc';

export type TravelType = 'all' | 'luxury' | 'adventure' | 'family' | 'honeymoon' | 'cultural' | 'nature';

export interface Destination {
  id: number;
  destinationId: string;
  city: string;
  name: string;
  country: string;
  flag: string;
  region: string;
  imageQuery: string;
  imageUrl: string;
  image: string;
  rating: number;
  priceFrom: number;
  priceTo: number;
  popularity: number;
  tags: string[];
  description: string;
}

export interface DestinationFilterState {
  sortBy: SortOption;
  searchTerm: string;
  travelType: TravelType;
  maxBudget: number;
  region: string;
}

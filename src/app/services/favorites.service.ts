import { Injectable } from '@angular/core';

import { Destination } from '../models/destination.model';
import { AuthService } from './auth.service';

const FAVORITES_STORAGE_KEY = 'tourism_favorites';

export interface FavoriteDestination {
  id: string;
  name: string;
  country: string;
  rating: number;
  price: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  constructor(private readonly authService: AuthService) {}

  addFavorite(destination: Destination): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      return;
    }

    const favoritesByUser = this.readFavoritesByUser();
    const currentFavorites = favoritesByUser[userId] ?? [];

    if (currentFavorites.some((favorite) => favorite.id === destination.destinationId)) {
      return;
    }

    favoritesByUser[userId] = [
      ...currentFavorites,
      {
        id: destination.destinationId,
        name: destination.name,
        country: destination.country,
        rating: destination.rating,
        price: destination.priceFrom,
        image: destination.imageUrl
      }
    ];

    this.writeFavoritesByUser(favoritesByUser);
  }

  removeFavorite(destinationId: string): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      return;
    }

    const favoritesByUser = this.readFavoritesByUser();
    const currentFavorites = favoritesByUser[userId] ?? [];

    favoritesByUser[userId] = currentFavorites.filter((favorite) => favorite.id !== destinationId);
    this.writeFavoritesByUser(favoritesByUser);
  }

  getFavorites(userId: string): FavoriteDestination[] {
    const favoritesByUser = this.readFavoritesByUser();
    return favoritesByUser[userId] ?? [];
  }

  isFavorite(destinationId: string): boolean {
    const userId = this.getCurrentUserId();

    if (!userId) {
      return false;
    }

    return this.getFavorites(userId).some((favorite) => favorite.id === destinationId);
  }

  private getCurrentUserId(): string | null {
    return this.authService.getCurrentUserSnapshot()?.uid ?? null;
  }

  private readFavoritesByUser(): Record<string, FavoriteDestination[]> {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, FavoriteDestination[]>) : {};
    } catch {
      return {};
    }
  }

  private writeFavoritesByUser(favoritesByUser: Record<string, FavoriteDestination[]>): void {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesByUser));
  }
}

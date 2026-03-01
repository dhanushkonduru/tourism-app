import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Destination, SortOption, TravelType } from '../../models/destination.model';
import { DestinationService } from '../../services/destination.service';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface Package {
  id: number;
  title: string;
  image: string;
  duration: string;
  nights: number;
  price: number;
  rating: number;
  description: string;
  includes: string[];
}

interface Testimonial {
  id: number;
  name: string;
  country: string;
  text: string;
  avatar: string;
  rating: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  searchDestination = '';
  searchDate = '';
  searchType = '';

  sortBy: SortOption = 'popularity';
  filterType: TravelType = 'all';
  minBudget = 0;
  maxBudget = 5000;

  featuredDestinations: Destination[] = [];
  totalDestinations = 0;

  private readonly featuredLimit = 6;

  currentTestimonialIndex = 0;

  readonly features: Feature[] = [
    {
      id: 1,
      icon: '🔐',
      title: 'Secure International Booking',
      description: 'Bank-level encryption and secure payment gateways for global transactions'
    },
    {
      id: 2,
      icon: '🌍',
      title: '24/7 Global Support',
      description: 'Round-the-clock multilingual assistance wherever you are'
    },
    {
      id: 3,
      icon: '💎',
      title: 'Best Price Guarantee',
      description: 'Competitive pricing with exclusive deals and no hidden fees'
    },
    {
      id: 4,
      icon: '✨',
      title: 'Curated Premium Experiences',
      description: 'Handpicked destinations and verified luxury accommodations'
    }
  ];

  readonly popularPackages: Package[] = [
    {
      id: 1,
      title: 'Bali Paradise Retreat',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format',
      duration: '5 Days',
      nights: 4,
      price: 1299,
      rating: 4.9,
      description: 'Luxury beachfront resort with spa treatments and cultural tours',
      includes: ['5-Star Resort', 'Daily Breakfast', 'Airport Transfer', 'Guided Tours']
    },
    {
      id: 2,
      title: 'Swiss Alps Adventure',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format',
      duration: '7 Days',
      nights: 6,
      price: 2499,
      rating: 5,
      description: 'Mountain resorts, scenic trains, and breathtaking Alpine experiences',
      includes: ['Luxury Chalet', 'All Meals', 'Ski Pass', 'Private Guide']
    },
    {
      id: 3,
      title: 'Maldives Overwater Escape',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format',
      duration: '6 Days',
      nights: 5,
      price: 3299,
      rating: 5,
      description: 'All-inclusive luxury overwater villa with private butler service',
      includes: ['Overwater Villa', 'All-Inclusive', 'Water Sports', 'Spa Access']
    },
    {
      id: 4,
      title: 'European Grand Tour',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop&auto=format',
      duration: '10 Days',
      nights: 9,
      price: 3899,
      rating: 4.8,
      description: 'Paris, Rome, Venice - explore Europe\'s most iconic cities',
      includes: ['4-Star Hotels', 'Train Tickets', 'City Tours', 'Museum Passes']
    }
  ];

  readonly testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      country: 'United States',
      text: 'Absolutely incredible service! The personalized recommendations made our honeymoon in Bali unforgettable. Every detail was perfect and the luxury resort exceeded all expectations.',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5
    },
    {
      id: 2,
      name: 'James Chen',
      country: 'Singapore',
      text: 'Best travel platform I\'ve used. The Swiss Alps package was phenomenal - from the luxury chalet to the private guide. Real-time support helped us throughout the journey.',
      avatar: 'https://i.pravatar.cc/150?img=13',
      rating: 5
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      country: 'Spain',
      text: 'The European Grand Tour was a dream come true. Seamless booking, excellent accommodations, and the curated experiences were world-class. Will definitely book again!',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 5
    },
    {
      id: 4,
      name: 'Mohammed Al-Rashid',
      country: 'United Arab Emirates',
      text: 'The Maldives overwater villa package was pure luxury. The attention to detail and premium service throughout made this our best vacation ever. Highly recommended!',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 5
    }
  ];

  private readonly subscriptions = new Subscription();

  constructor(private readonly destinationService: DestinationService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.destinationService.filteredDestinations$.subscribe((destinations) => {
        this.featuredDestinations = destinations.slice(0, this.featuredLimit);
      })
    );

    this.subscriptions.add(
      this.destinationService.totalCount$.subscribe((total) => {
        this.totalDestinations = total;
      })
    );

    this.subscriptions.add(
      this.destinationService.filterState$.subscribe((state) => {
        this.sortBy = state.sortBy;
        this.filterType = state.travelType;
        this.maxBudget = state.maxBudget;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSearch(): void {
    console.log('Searching...', {
      destination: this.searchDestination,
      date: this.searchDate,
      type: this.searchType
    });
  }

  onSortChange(): void {
    this.destinationService.setSortBy(this.sortBy);
  }

  onFilterChange(): void {
    this.destinationService.setTravelType(this.filterType);
  }

  onBudgetChange(): void {
    this.destinationService.setMaxBudget(this.maxBudget);
  }

  getStars(rating: number): string[] {
    return Array(5)
      .fill('★')
      .map((star, index) => (index < rating ? star : '☆'));
  }

  nextTestimonial(): void {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonialIndex = this.currentTestimonialIndex === 0 ? this.testimonials.length - 1 : this.currentTestimonialIndex - 1;
  }

  get currentTestimonial(): Testimonial {
    return this.testimonials[this.currentTestimonialIndex];
  }
}

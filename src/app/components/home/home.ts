import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Destination {
  id: number;
  name: string;
  image: string;
  rating: number;
  description: string;
  badge: string;
}

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
  price: string;
  description: string;
  highlight?: string;
}

interface GalleryPhoto {
  id: number;
  url: string;
  caption: string;
  size: string;
}

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  avatar: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  featuredDestinations: Destination[] = [
    {
      id: 1,
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      rating: 4.9,
      description: 'The city of lights, romance, and timeless elegance',
      badge: 'Trending'
    },
    {
      id: 2,
      name: 'Santorini, Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
      rating: 4.8,
      description: 'Stunning sunsets and white-washed architecture',
      badge: 'Popular'
    },
    {
      id: 3,
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      rating: 4.7,
      description: 'Tropical paradise with rich culture and nature',
      badge: 'Hot Deal'
    },
    {
      id: 4,
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      rating: 4.9,
      description: 'Luxury, innovation, and desert adventures',
      badge: 'Luxury'
    },
    {
      id: 5,
      name: 'Maldives',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
      rating: 5.0,
      description: 'Crystal-clear waters and overwater villas',
      badge: 'Premium'
    },
    {
      id: 6,
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
      rating: 4.8,
      description: 'Modern metropolis meets ancient tradition',
      badge: 'Cultural'
    }
  ];

  features: Feature[] = [
    {
      id: 1,
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'AI-powered suggestions tailored to your travel preferences and budget'
    },
    {
      id: 2,
      icon: '🔒',
      title: 'Secure Booking',
      description: 'Bank-level encryption and secure payment gateways for peace of mind'
    },
    {
      id: 3,
      icon: '☁️',
      title: 'Cloud Powered Performance',
      description: 'Lightning-fast booking experience with real-time availability'
    },
    {
      id: 4,
      icon: '💬',
      title: 'Real-Time Assistance',
      description: '24/7 customer support with instant chat and multilingual help'
    }
  ];

  popularPackages: Package[] = [
    {
      id: 1,
      title: 'European Grand Tour',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
      duration: '14 Days',
      price: '$3,499',
      description: 'Explore 7 iconic European cities with guided tours and luxury stays',
      highlight: 'Best Seller'
    },
    {
      id: 2,
      title: 'Tropical Paradise Escape',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      duration: '7 Days',
      price: '$2,199',
      description: 'All-inclusive beach resort with water sports and spa treatments'
    },
    {
      id: 3,
      title: 'Adventure in New Zealand',
      image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=800&q=80',
      duration: '10 Days',
      price: '$4,299',
      description: 'Hiking, bungee jumping, and scenic landscapes of Middle Earth',
      highlight: 'Adventure'
    }
  ];

  galleryPhotos: GalleryPhoto[] = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      caption: 'Mountain Peaks',
      size: 'large'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      caption: 'Island Dreams',
      size: 'medium'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      caption: 'City Lights',
      size: 'medium'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
      caption: 'Desert Sunset',
      size: 'large'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80',
      caption: 'Forest Trail',
      size: 'small'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      caption: 'Ocean Views',
      size: 'small'
    }
  ];

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      location: 'New York, USA',
      text: 'Absolutely incredible service! The personalized recommendations made our honeymoon in Bali unforgettable. Every detail was perfect.',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'James Chen',
      location: 'Singapore',
      text: 'Best travel platform I\'ve used. Real-time support helped us when our flight was delayed. The team went above and beyond.',
      avatar: 'https://i.pravatar.cc/150?img=13'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      location: 'Barcelona, Spain',
      text: 'Booking was seamless and secure. The European tour package exceeded all expectations. Will definitely use again!',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  ];
}


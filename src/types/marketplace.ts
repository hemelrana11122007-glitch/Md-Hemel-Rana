export type ProductSegment = 'retail' | 'wholesale' | 'import';

export interface Product {
  id: string;
  title: string;
  segment: ProductSegment;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  seller: {
    id: string;
    name: string;
    badge: string;
    verified: boolean;
  };
  moq?: number; // Minimum Order Quantity for wholesale
  originCountry?: string; // For import items
  shippingTime?: string;
  inStock: boolean;
  isTrending?: boolean;
  isBestProduct?: boolean;
  description: string;
}

export interface Seller {
  id: string;
  name: string;
  role: string;
  avatar: string;
  badge: string;
  rating: number;
  totalSales: string;
  responseRate: string;
  joinedYear: number;
  location: string;
  segment: ProductSegment;
  productsCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  origin: string;
  productsCount: number;
}

export interface GroupPost {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  title: string;
  preview: string;
  repliesCount: number;
  likesCount: number;
  timeAgo: string;
  tag: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

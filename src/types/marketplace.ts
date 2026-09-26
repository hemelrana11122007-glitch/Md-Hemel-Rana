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

export interface MarketFeedComment {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  timeAgo: string;
}

export interface MarketFeedPost {
  id: string;
  authorId?: string;
  sellerId?: string;
  sellerStatus?: string;
  isLocked?: boolean;
  author: {
    id?: string;
    name: string;
    role: string;
    avatar: string;
    company?: string;
    location?: string;
  };
  title: string;
  preview: string;
  content?: string;
  repliesCount: number;
  likesCount: number;
  timeAgo: string;
  tag: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  isLiked?: boolean;
  isFollowing?: boolean;
  isSaved?: boolean;
  sourceType?: 'own' | 'seller' | 'community';
  comments?: MarketFeedComment[];
}

export type GroupPost = MarketFeedPost;

export interface CartItem {
  product: Product;
  quantity: number;
}

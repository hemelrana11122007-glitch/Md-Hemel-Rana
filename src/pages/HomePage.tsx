import React, { useState } from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { PopularCategories } from '../components/PopularCategories';
import { SpecialOfferSection } from '../components/SpecialOfferSection';
import { TrendingProducts } from '../components/TrendingProducts';
import { BestProducts } from '../components/BestProducts';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { PopularBrands } from '../components/PopularBrands';
import { ProductSegments } from '../components/ProductSegments';
import { FeaturedSellers } from '../components/FeaturedSellers';
import { MarketFeed } from '../components/MarketFeed';
import { SobaiAIDrawer } from '../components/SobaiAIDrawer';
import { Product, MarketFeedPost, Seller } from '../types/marketplace';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onNavigatePage: (page: string, urlPath?: string) => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectBrand: (brandName: string) => void;
  onOpenCategoriesModal: () => void;
  onOpenBrandsModal: () => void;
  onJoinDiscussion: () => void;
  onViewPost: (post: MarketFeedPost) => void;
  onVisitSeller: (seller: Seller) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  onNavigatePage,
  onSelectCategory,
  onSelectBrand,
  onOpenCategoriesModal,
  onOpenBrandsModal,
  onJoinDiscussion,
  onViewPost,
  onVisitSeller,
}) => {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  return (
    <div>
      {/* 1. HERO SECTION & 5-COLUMN TRUST BADGES */}
      <HeroSlider
        onShopNow={() => onNavigatePage('shop')}
        onExploreWholesale={() => onNavigatePage('wholesale')}
        onExploreImports={() => onNavigatePage('import')}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* 2. SHOP BY CATEGORY GRID SECTION (Left Banner + 10-Card Grid) */}
      <PopularCategories
        onSelectCategory={(catName) => {
          onSelectCategory(catName);
          onNavigatePage('shop', '/shop');
        }}
        onBrowseAllCategories={() => onNavigatePage('categories', '/categories')}
      />

      {/* 3. SPECIAL OFFER & MEGA DEAL BANNER (Interactive Carousel + 4 Deal Cards) */}
      <SpecialOfferSection
        allProducts={products}
        onNavigateToOffer={(offerId) => {
          onNavigatePage('special-offer-detail', `/special-offers/${offerId}`);
        }}
        onShopNow={(targetSegment) => {
          if (targetSegment === 'wholesale') onNavigatePage('wholesale');
          else if (targetSegment === 'import') onNavigatePage('import');
          else if (targetSegment === 'retail') onNavigatePage('retail');
          else onNavigatePage('shop');
        }}
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
      />

      {/* 4. TRENDING PRODUCTS */}
      <TrendingProducts
        products={products}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
      />

      {/* FEATURED PRODUCTS SECTION (Dynamically visible only if featured products exist) */}
      <FeaturedProducts
        products={products}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
      />

      {/* 5. BEST PRODUCTS SECTION */}
      <BestProducts
        products={products}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
      />

      {/* 6. POPULAR BRANDS */}
      <PopularBrands
        onSelectBrand={(brandName) => {
          onSelectBrand(brandName);
          onNavigatePage('shop');
        }}
        onBrowseAllBrands={onOpenBrandsModal}
      />

      {/* 7. PRODUCT SEGMENTS (Retail, Wholesale, Import) */}
      <ProductSegments
        products={products}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
        onQuickView={onQuickView}
        onNavigateFile={(filename) => {
          if (filename.includes('retail')) onNavigatePage('retail');
          else if (filename.includes('wholesale')) onNavigatePage('wholesale');
          else if (filename.includes('import')) onNavigatePage('import');
        }}
      />

      {/* 8. FEATURED SELLERS */}
      <FeaturedSellers
        onVisitSeller={onVisitSeller}
        onBrowseAllSellers={() => onNavigatePage('sellers')}
      />

      {/* 9. MARKET FEED SECTION */}
      <MarketFeed
        onJoinDiscussion={onJoinDiscussion}
        onViewPost={onViewPost}
      />

      {/* SOB AI SHOPPING ASSISTANT DRAWER */}
      <SobaiAIDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onNavigateShop={(cat) => {
          setIsAIAssistantOpen(false);
          if (cat) onSelectCategory(cat);
          onNavigatePage('shop');
        }}
      />
    </div>
  );
};

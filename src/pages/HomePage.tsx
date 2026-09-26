import React from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { PopularCategories } from '../components/PopularCategories';
import { TrendingProducts } from '../components/TrendingProducts';
import { BestProducts } from '../components/BestProducts';
import { PopularBrands } from '../components/PopularBrands';
import { ProductSegments } from '../components/ProductSegments';
import { FeaturedSellers } from '../components/FeaturedSellers';
import { MarketFeed } from '../components/MarketFeed';
import { Product, MarketFeedPost, Seller } from '../types/marketplace';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onNavigatePage: (page: string) => void;
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
  return (
    <div>
      {/* 2. HERO SECTION */}
      <HeroSlider
        onShopNow={() => onNavigatePage('shop')}
        onExploreWholesale={() => onNavigatePage('wholesale')}
        onExploreImports={() => onNavigatePage('import')}
      />

      {/* 3. POPULAR CATEGORIES */}
      <PopularCategories
        onSelectCategory={(catName) => {
          onSelectCategory(catName);
          onNavigatePage('shop');
        }}
        onBrowseAllCategories={onOpenCategoriesModal}
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
    </div>
  );
};

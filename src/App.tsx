import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { RetailPage } from './pages/RetailPage';
import { WholesalePage } from './pages/WholesalePage';
import { ImportPage } from './pages/ImportPage';
import { SellersPage } from './pages/SellersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { MarketFeedPage } from './pages/MarketFeedPage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { BecomeSellerPage } from './pages/BecomeSellerPage';
import { SellerRegisterPage } from './pages/SellerRegisterPage';
import { SpecialOfferPage } from './pages/SpecialOfferPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AddProductPage } from './pages/AddProductPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Drawers & Modals
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { JoinDiscussionModal } from './components/JoinDiscussionModal';
import { AuthModal } from './components/AuthModal';
import { DevMailboxModal } from './components/DevMailboxModal';
import { TaxonomyModal } from './components/TaxonomyModal';
import { CheckoutModal } from './components/CheckoutModal';
import { useAuth } from './context/AuthContext';

// Data & Types
import { PRODUCTS, SELLERS } from './data/mockData';
import { Product, CartItem, Seller, MarketFeedPost } from './types/marketplace';
import { CheckCircle2, X, Mail, Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';

export default function App() {
  // Routing Helper to parse initial path
  const getPageFromPath = (path: string): string => {
    const clean = path.toLowerCase().replace(/^\//, '');
    if (clean.startsWith('special-offers') || clean.startsWith('campaign')) {
      return 'special-offer-detail';
    }
    if (clean.includes('retailer/products/add-new') || clean.includes('wholesaler/products/add-new') || clean.includes('importer/products/add-new') || clean.includes('seller/products/add-new')) return 'seller-add-product';
    if (clean.includes('register/retailer')) return 'register-retailer';
    if (clean.includes('register/wholesaler')) return 'register-wholesaler';
    if (clean.includes('register/importer')) return 'register-importer';
    if (clean.includes('categories')) return 'categories';
    if (clean.includes('shop')) return 'shop';
    if (clean.includes('retail')) return 'retail';
    if (clean.includes('wholesale')) return 'wholesale';
    if (clean.includes('import')) return 'import';
    if (clean.includes('seller/retailer/dashboard')) return 'seller-retailer-dashboard';
    if (clean.includes('seller/wholesaler/dashboard')) return 'seller-wholesaler-dashboard';
    if (clean.includes('seller/importer/dashboard')) return 'seller-importer-dashboard';
    if (clean.includes('seller-dashboard') || clean.includes('seller/dashboard')) return 'seller-dashboard';
    if (clean.includes('become-a-seller')) return 'become-a-seller';
    if (clean.includes('seller')) return 'sellers';
    if (clean.includes('about')) return 'about';
    if (clean.includes('contact')) return 'contact';
    if (clean.includes('market-feed') || clean.includes('group')) return 'market-feed';
    if (clean.includes('admin')) return 'admin';
    if (clean.includes('login')) return 'login';
    if (clean.includes('register')) return 'register';
    if (clean.includes('verify')) return 'verify';
    if (clean.includes('customer-dashboard')) return 'customer-dashboard';
    return 'home';
  };

  const [activePage, setActivePage] = useState<string>(() =>
    getPageFromPath(window.location.pathname)
  );

  const [selectedOfferId, setSelectedOfferId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/(special-offers|campaign)\/(.+)/);
      if (match) return match[2];
    }
    return 'offer-summer-deal';
  });

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);

  // Dynamic Combined Products List State (Mock Data + Live Database Products)
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);

  const fetchDynamicProducts = async () => {
    try {
      const res = await fetch('/api/products/public');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          // Map database products to frontend Product format
          const mappedDb: Product[] = data.products.map((p: any) => {
            let segment: 'retail' | 'wholesale' | 'import' = 'retail';
            const vType = String(p.vendor_type || '').toLowerCase();
            if (vType.includes('wholesal')) {
              segment = 'wholesale';
            } else if (vType.includes('import')) {
              segment = 'import';
            }

            return {
              id: p.id,
              title: p.title,
              segment,
              category: p.category || 'General',
              price: Number(p.price) || 0,
              originalPrice: p.old_price ? Number(p.old_price) : undefined,
              rating: 5.0,
              reviewsCount: 0,
              image: p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
              seller: {
                id: p.seller_id,
                name: p.seller_name || 'Verified Merchant',
                badge: p.badge || (segment === 'wholesale' ? 'Verified Wholesaler' : segment === 'import' ? 'Certified Importer' : 'Verified Retailer'),
                verified: true
              },
              moq: p.moq ? Number(p.moq) : (segment === 'wholesale' ? 10 : 1),
              originCountry: p.country_source || undefined,
              shippingTime: segment === 'import' ? '4-7 Business Days (Air Express)' : '1-3 Days (Standard)',
              inStock: p.stock > 0,
              isTrending: false,
              isBestProduct: true,
              isFeatured: Boolean(p.is_featured),
              specialOfferId: p.special_offer_id || undefined,
              description: p.description || '',
              weight_kg: p.weight_kg ? Number(p.weight_kg) : undefined,
              bd_import_cost: p.import_cost_bdt ? Number(p.import_cost_bdt) : undefined,
            };
          });

          // Filter out matching duplicate IDs from mock data
          const filteredMock = PRODUCTS.filter(mock => !mappedDb.some(dbProd => dbProd.id === mock.id));
          setProductsList([...mappedDb, ...filteredMock]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dynamic products:', err);
    }
  };

  useEffect(() => {
    fetchDynamicProducts();
  }, [activePage]);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1 },
    { product: PRODUCTS[1], quantity: 1 },
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([PRODUCTS[2].id]);

  const { user, isMailboxOpen, setIsMailboxOpen, devEmails } = useAuth();

  // Modals Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register' | 'forgot' | 'reset' | 'verify'>('signin');
  const [authModalToken, setAuthModalToken] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [selectedDiscussionPost, setSelectedDiscussionPost] = useState<MarketFeedPost | null>(null);
  const [taxonomyModalType, setTaxonomyModalType] = useState<'categories' | 'brands' | null>(null);

  // Check URL query parameters for verification or reset tokens
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyToken = urlParams.get('verify_token');
      const resetToken = urlParams.get('reset_token');
      if (verifyToken) {
        setAuthModalMode('verify');
        setAuthModalToken(verifyToken);
        setIsAuthOpen(true);
      } else if (resetToken) {
        setAuthModalMode('reset');
        setAuthModalToken(resetToken);
        setIsAuthOpen(true);
      }
    } catch {
      // Ignored
    }
  }, []);

  // Global Auto-Redirect upon Login / Registration success (standalone auth page inputs)
  useEffect(() => {
    if (user) {
      if (activePage === 'login' || activePage === 'register' || activePage === 'verify') {
        if (user.role === 'admin') {
          handleNavigatePage('admin', '/admin');
        } else {
          handleNavigatePage('customer-dashboard', '/customer-dashboard');
        }
      }
    } else {
      if (activePage === 'customer-dashboard') {
        handleNavigatePage('home', '/');
      }
    }
  }, [user, activePage]);

  const handleMailboxAction = (type: 'verify' | 'reset', token: string) => {
    setAuthModalMode(type === 'verify' ? 'verify' : 'reset');
    setAuthModalToken(token);
    setIsAuthOpen(true);
  };

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Browser Navigation History Handler
  const handleNavigatePage = (pageId: string, urlPath?: string) => {
    setActivePage(pageId);
    if (urlPath) {
      const match = urlPath.match(/\/(special-offers|campaign)\/(.+)/);
      if (match) {
        setSelectedOfferId(match[2]);
      }
    }
    const targetUrl =
      urlPath ||
      (pageId === 'home'
        ? '/'
        : pageId === 'shop'
        ? '/shop'
        : pageId === 'retail'
        ? '/retail'
        : pageId === 'wholesale'
        ? '/wholesale'
        : pageId === 'import'
        ? '/import'
        : `/${pageId}`);

    try {
      window.history.pushState({ pageId }, '', targetUrl);
    } catch {
      // In constrained iframe environments, pushState is silently handled
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to popstate (browser back/forward button)
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const page = getPageFromPath(path);
      const match = path.match(/\/(special-offers|campaign)\/(.+)/);
      if (match) {
        setSelectedOfferId(match[2]);
      }
      setActivePage(page);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.title}" to cart`);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed item from cart');
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Removed "${product.title}" from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved "${product.title}" to wishlist`);
        return [...prev, product.id];
      }
    });
  };

  const wishlistProducts = useMemo(() => {
    return productsList.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds, productsList]);

  // If active page is Admin Dashboard, render the dedicated Super Admin Portal layout
  if (activePage === 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFA] font-sans text-slate-800 antialiased selection:bg-[#008080] selection:text-white">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <AdminDashboardPage
          onNavigateHome={() => handleNavigatePage('home', '/')}
          onOpenAuth={() => {
            setAuthModalMode('signin');
            setIsAuthOpen(true);
          }}
          onShowToast={showToast}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            setAuthModalToken('');
          }}
          onSuccess={(user) => {
            showToast(`Welcome back, ${user.name}!`);
            if (user.role === 'admin') {
              handleNavigatePage('admin', '/admin');
            } else {
              handleNavigatePage('customer-dashboard', '/customer-dashboard');
            }
          }}
          onOpenMailbox={() => setIsMailboxOpen(true)}
          initialMode={authModalMode}
          initialToken={authModalToken}
        />

        <DevMailboxModal onSelectAction={handleMailboxAction} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFA] flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008080] selection:text-white max-w-[100vw] overflow-x-hidden ${
      activePage !== 'customer-dashboard' && !activePage.includes('seller-') && activePage !== 'seller-dashboard'
        ? 'pb-16 md:pb-0'
        : ''
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Persistent Navbar across all pages, except customer & seller dashboards */}
      {activePage !== 'customer-dashboard' &&
        !activePage.includes('seller-') &&
        activePage !== 'seller-dashboard' && (
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlistIds.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAuth={(mode = 'signin') => {
            setAuthModalMode(mode);
            setIsAuthOpen(true);
          }}
          onSearch={(query, cat) => {
            setSearchQuery(query);
            if (cat !== 'All') {
              setSelectedFilterCategory(cat);
            } else {
              setSelectedFilterCategory(null);
            }
            if (query.trim() && activePage === 'home') {
              handleNavigatePage('shop', '/shop');
            }
          }}
          activePage={activePage}
          onNavigatePage={handleNavigatePage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Main Page Rendering Based on Active Route */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            products={productsList}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onNavigatePage={handleNavigatePage}
            onSelectCategory={(catName) => {
              setSelectedFilterCategory(catName);
              handleNavigatePage('shop', '/shop');
            }}
            onSelectBrand={(brandName) => {
              setSearchQuery(brandName);
              handleNavigatePage('shop', '/shop');
            }}
            onOpenCategoriesModal={() => handleNavigatePage('categories', '/categories')}
            onOpenBrandsModal={() => setTaxonomyModalType('brands')}
            onJoinDiscussion={() => {
              setSelectedDiscussionPost(null);
              setIsDiscussionOpen(true);
            }}
            onViewPost={(post) => {
              setSelectedDiscussionPost(post);
              setIsDiscussionOpen(true);
            }}
            onVisitSeller={(seller) => {
              setSearchQuery(seller.name);
              handleNavigatePage('shop', '/shop');
              showToast(`Showing items from ${seller.name}`);
            }}
          />
        )}

        {activePage === 'special-offer-detail' && (
          <SpecialOfferPage
            offerId={selectedOfferId}
            allProducts={productsList}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'categories' && (
          <CategoriesPage
            onSelectCategory={(catName) => {
              setSelectedFilterCategory(catName);
              handleNavigatePage('shop', '/shop');
            }}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'shop' && (
          <ShopPage
            products={productsList}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            searchQuery={searchQuery}
            selectedCategory={selectedFilterCategory}
            onSelectCategory={setSelectedFilterCategory}
            initialSegment="all"
          />
        )}

        {activePage === 'retail' && (
          <RetailPage
            products={productsList}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            searchQuery={searchQuery}
          />
        )}

        {activePage === 'wholesale' && (
          <WholesalePage
            products={productsList}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            searchQuery={searchQuery}
          />
        )}

        {activePage === 'import' && (
          <ImportPage
            products={productsList}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            searchQuery={searchQuery}
          />
        )}

        {activePage === 'sellers' && (
          <SellersPage
            onVisitSeller={(seller) => {
              setSearchQuery(seller.name);
              handleNavigatePage('shop', '/shop');
              showToast(`Showing items from ${seller.name}`);
            }}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'become-a-seller' && (
          <BecomeSellerPage
            onNavigatePage={handleNavigatePage}
            onOpenAuthModal={(mode = 'register') => {
              setAuthModalMode(mode);
              setIsAuthOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {activePage === 'register-retailer' && (
          <SellerRegisterPage
            category="retailer"
            onNavigatePage={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {activePage === 'register-wholesaler' && (
          <SellerRegisterPage
            category="wholesaler"
            onNavigatePage={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {activePage === 'register-importer' && (
          <SellerRegisterPage
            category="importer"
            onNavigatePage={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {activePage === 'about' && <AboutPage />}

        {activePage === 'contact' && <ContactPage />}

        {(activePage === 'market-feed' || activePage === 'group') && (
          <MarketFeedPage
            onJoinDiscussion={() => {
              setSelectedDiscussionPost(null);
              setIsDiscussionOpen(true);
            }}
            onViewPost={(post) => {
              setSelectedDiscussionPost(post);
              setIsDiscussionOpen(true);
            }}
          />
        )}

        {(activePage === 'login' || activePage === 'register' || activePage === 'verify') && (
          <AuthPage
            initialMode={activePage === 'verify' ? 'verify' : activePage === 'register' ? 'register' : 'login'}
            onNavigateHome={() => handleNavigatePage('home', '/')}
            onNavigateAdmin={() => handleNavigatePage('admin', '/admin')}
            onNavigatePage={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {(activePage === 'seller-dashboard' ||
          activePage === 'seller-retailer-dashboard' ||
          activePage === 'seller-wholesaler-dashboard' ||
          activePage === 'seller-importer-dashboard') && (
          <ProtectedRoute
            allowedRoles={['seller', 'admin']}
            onNavigateHome={() => handleNavigatePage('home', '/')}
            onOpenAuth={() => {
              setAuthModalMode('signin');
              setIsAuthOpen(true);
            }}
          >
            <SellerDashboardPage
              onNavigateHome={() => handleNavigatePage('home', '/')}
              onShowToast={showToast}
              onNavigatePage={handleNavigatePage}
            />
          </ProtectedRoute>
        )}

        {activePage === 'seller-add-product' && (
          <ProtectedRoute
            allowedRoles={['seller', 'admin']}
            onNavigateHome={() => handleNavigatePage('home', '/')}
            onOpenAuth={() => {
              setAuthModalMode('signin');
              setIsAuthOpen(true);
            }}
          >
            <AddProductPage
              onBackToDashboard={() => {
                const bType = (user?.business_type || 'Retailer').toLowerCase();
                if (bType.includes('wholesale')) {
                  handleNavigatePage('seller-wholesaler-dashboard', '/seller/wholesaler/dashboard');
                } else if (bType.includes('import')) {
                  handleNavigatePage('seller-importer-dashboard', '/seller/importer/dashboard');
                } else {
                  handleNavigatePage('seller-retailer-dashboard', '/seller/retailer/dashboard');
                }
              }}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        )}

        {activePage === 'customer-dashboard' && (
          <ProtectedRoute
            allowedRoles={['buyer', 'seller', 'admin']}
            onNavigateHome={() => handleNavigatePage('home', '/')}
            onOpenAuth={() => {
              setAuthModalMode('signin');
              setIsAuthOpen(true);
            }}
          >
            <CustomerDashboardPage
              onNavigateHome={() => handleNavigatePage('home', '/')}
              onShowToast={showToast}
              cart={cart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              wishlistProducts={wishlistProducts}
              onRemoveFromWishlist={(id) => setWishlistIds((prev) => prev.filter((item) => item !== id))}
              onAddToCart={handleAddToCart}
            />
          </ProtectedRoute>
        )}
      </main>

      {/* Persistent Footer across all pages, except customer & seller dashboards */}
      {activePage !== 'customer-dashboard' && !activePage.includes('seller-') && activePage !== 'seller-dashboard' && <Footer onNavigatePage={handleNavigatePage} />}

      {/* Drawers & Modals (Available and active across all pages) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onClearCart={() => setCart([])}
        onShowToast={showToast}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistProducts}
        onRemoveItem={(id) => {
          setWishlistIds((prev) => prev.filter((item) => item !== id));
        }}
        onAddToCart={handleAddToCart}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
      />

      <JoinDiscussionModal
        isOpen={isDiscussionOpen}
        onClose={() => {
          setIsDiscussionOpen(false);
          setSelectedDiscussionPost(null);
        }}
        selectedPost={selectedDiscussionPost}
        onNewPost={(title) => {
          showToast(`Discussion "${title}" posted successfully!`);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthModalToken('');
        }}
        onSuccess={(user) => {
          showToast(`Welcome back, ${user.name}!`);
          if (user.role === 'admin') {
            handleNavigatePage('admin', '/admin');
          } else if (user.role === 'seller') {
            const catKey = (user.business_type || 'Retailer').toLowerCase();
            handleNavigatePage(`seller-${catKey}-dashboard`, `/seller/${catKey}/dashboard`);
          } else {
            handleNavigatePage('customer-dashboard', '/customer-dashboard');
          }
        }}
        onOpenMailbox={() => setIsMailboxOpen(true)}
        initialMode={authModalMode}
        initialToken={authModalToken}
      />

      <DevMailboxModal onSelectAction={handleMailboxAction} />

      <TaxonomyModal
        type={taxonomyModalType}
        onClose={() => setTaxonomyModalType(null)}
        onSelectCategory={(catName) => {
          setSelectedFilterCategory(catName);
          handleNavigatePage('shop', '/shop');
        }}
        onSelectBrand={(brandName) => {
          setSearchQuery(brandName);
          handleNavigatePage('shop', '/shop');
        }}
      />

      {/* Mobile Bottom Navigation Bar for Marketplace */}
      {activePage !== 'customer-dashboard' &&
        !activePage.includes('seller-') &&
        activePage !== 'seller-dashboard' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            onClick={() => handleNavigatePage('home', '/')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
              activePage === 'home' ? 'text-[#008080]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigatePage('shop', '/shop')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
              activePage === 'shop' ? 'text-[#008080]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Shop</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="relative flex flex-col items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-0.5 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
            <span className="text-[10px] font-semibold mt-0.5">Wishlist</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-0.5 right-2 w-4 h-4 bg-[#008080] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
            <span className="text-[10px] font-semibold mt-0.5">Cart</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (user) {
                if (user.role === 'admin') {
                  handleNavigatePage('admin', '/admin');
                } else if (user.role === 'seller') {
                  const catKey = (user.business_type || 'Retailer').toLowerCase();
                  handleNavigatePage(`seller-${catKey}-dashboard`, `/seller/${catKey}/dashboard`);
                } else {
                  handleNavigatePage('customer-dashboard', '/customer-dashboard');
                }
              } else {
                setAuthModalMode('signin');
                setIsAuthOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
              activePage === 'customer-dashboard' || activePage.includes('seller-')
                ? 'text-[#008080]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">
              {user ? 'Account' : 'Login'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

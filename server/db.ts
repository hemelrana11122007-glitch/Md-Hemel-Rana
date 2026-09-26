import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface KycData {
  nid_front_url?: string;
  nid_back_url?: string;
  trade_license_url?: string;
  photo_url?: string;
  present_address?: string;
  permanent_address?: string;
  submitted_at?: string;
  updated_at?: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'buyer' | 'seller' | 'admin';
  is_verified: boolean;
  verification_token: string | null;
  verification_token_expires: string | null;
  reset_token_hash: string | null;
  reset_token_expires: string | null;
  refresh_token_hash: string | null;
  two_factor_secret: string | null;
  two_factor_temp_secret?: string | null;
  two_factor_enabled: boolean;
  seller_status?: 'unverified' | 'pending' | 'approved' | 'suspended' | 'rejected' | 'need_docs';
  business_type?: 'Retailer' | 'Wholesaler' | 'Importer' | string;
  shop_id?: string;
  customer_id?: string;
  kyc_data?: KycData;
  store_name?: string;
  store_description?: string;
  phone?: string;
  avatar?: string;
  cover_photo?: string;
  address?: string;
  bio?: string;
  is_locked?: boolean;
  lock_reason?: string;
  notifications?: NotificationItem[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  title: string;
  description: string;
  price: number;
  old_price?: number;
  category: string;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  image_url?: string;
  video_url?: string;
  vendor_type?: 'Retailer' | 'Wholesaler' | 'Importer';
  sku?: string;
  brand?: string;
  badge?: string;
  is_featured?: boolean;
  special_offer_id?: string;
  weight_kg?: number;
  moq?: number;
  country_source?: string;
  import_cost_bdt?: number;
  supplier_location?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  courier_status?: 'locked' | 'ready_for_delivery' | 'shipped';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  seller_id: string;
  shop_id?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_customer_id?: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// In-memory caches synced to disk
let users: User[] = [];
let products: Product[] = [];
let orders: Order[] = [];

/**
 * Generate a sequential auto-increment Customer ID:
 * Format: CUST-10001, CUST-10002, CUST-10003, CUST-10004 ...
 */
export function generateCustomerId(): string {
  let highestNum = 10000;
  for (const u of users) {
    if (u.customer_id && u.customer_id.startsWith('CUST-')) {
      const parts = u.customer_id.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  }
  const nextNum = highestNum + 1;
  return `CUST-${nextNum}`;
}

/**
 * Generate a unique Sequential Role-Based Shop ID:
 * - Retailer: RTL-10001, RTL-10002...
 * - Wholesaler: WHS-10001, WHS-10002...
 * - Importer: IMP-10001, IMP-10002...
 */
export function generateShopId(businessType?: string): string {
  let prefix = 'RTL';
  const type = (businessType || '').toLowerCase();
  if (type.includes('wholesal')) {
    prefix = 'WHS';
  } else if (type.includes('import')) {
    prefix = 'IMP';
  } else {
    prefix = 'RTL';
  }

  let highestNum = 10000;
  for (const u of users) {
    if (u.shop_id && u.shop_id.startsWith(`${prefix}-`)) {
      const parts = u.shop_id.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  }
  return `${prefix}-${highestNum + 1}`;
}

function saveUsersToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

function saveProductsToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving products to disk:', err);
  }
}

function saveOrdersToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders to disk:', err);
  }
}

function ensureStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 1. Users Initialization
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(data);
    } else {
      users = [];
    }

    const defaultPasswordHash = bcrypt.hashSync('Password123!', 12);
    const now = new Date().toISOString();

    // Ensure demo buyer exists
    const existingDemoBuyer = users.find((u) => u.email === 'alex@armarketbd.com');
    if (!existingDemoBuyer) {
      users.push({
        id: 'usr_demo_buyer',
        name: 'Alex Merchant',
        email: 'alex@armarketbd.com',
        customer_id: 'CUST-10001',
        password_hash: defaultPasswordHash,
        role: 'buyer',
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
        reset_token_hash: null,
        reset_token_expires: null,
        refresh_token_hash: null,
        two_factor_secret: null,
        two_factor_enabled: false,
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        address: '142 Market Street, San Francisco, CA',
        bio: 'Avid tech enthusiast and conscious organic goods consumer.',
        created_at: now,
        updated_at: now,
      });
    } else {
      if (!existingDemoBuyer.customer_id) existingDemoBuyer.customer_id = 'CUST-10001';
    }

    // Ensure armarket super admin exists (Requirement: admin@armarket.com / Admin@2026#Secure)
    const armarketAdminHash = bcrypt.hashSync('Admin@2026#Secure', 12);
    const existingArmarketAdmin = users.find((u) => u.email.toLowerCase() === 'admin@armarket.com');
    if (!existingArmarketAdmin) {
      users.push({
        id: 'usr_armarket_super_admin',
        name: 'AR Super Admin',
        email: 'admin@armarket.com',
        password_hash: armarketAdminHash,
        role: 'admin',
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
        reset_token_hash: null,
        reset_token_expires: null,
        refresh_token_hash: null,
        two_factor_secret: null,
        two_factor_enabled: false,
        phone: '+880 1711-000001',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        address: 'AR Market BD Headquarters, Dhaka, Bangladesh',
        bio: 'Super Administrator & Chief Marketplace Security Officer for AR Market BD.',
        created_at: now,
        updated_at: now,
      });
    } else {
      existingArmarketAdmin.role = 'admin';
      existingArmarketAdmin.is_verified = true;
      if (!existingArmarketAdmin.password_hash || !bcrypt.compareSync('Admin@2026#Secure', existingArmarketAdmin.password_hash)) {
        existingArmarketAdmin.password_hash = armarketAdminHash;
      }
    }

    // Ensure legacy super admin exists as fallback
    if (!users.some((u) => u.email === 'admin@armarketbd.com')) {
      users.push({
        id: 'usr_demo_admin',
        name: 'Super Administrator',
        email: 'admin@armarketbd.com',
        password_hash: defaultPasswordHash,
        role: 'admin',
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
        reset_token_hash: null,
        reset_token_expires: null,
        refresh_token_hash: null,
        two_factor_secret: null,
        two_factor_enabled: false,
        phone: '+1 (555) 999-0001',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        address: 'AR Market BD HQ, Suite 500, Austin, TX',
        bio: 'Chief Platform Security & Marketplace Operations Manager.',
        created_at: now,
        updated_at: now,
      });
    }

    // Ensure demo seller exists
    const existingDemoSeller = users.find((u) => u.email === 'seller@armarketbd.com');
    if (!existingDemoSeller) {
      users.push({
        id: 'usr_demo_seller',
        name: 'Elena Rostova',
        email: 'seller@armarketbd.com',
        password_hash: defaultPasswordHash,
        role: 'seller',
        seller_status: 'approved',
        business_type: 'Retailer',
        shop_id: 'RTL-10024',
        store_name: 'Artisan Haven Studio',
        store_description: 'Handcrafted luxury ceramic and wooden homeware sustainably sourced.',
        phone: '+1 (555) 789-0123',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        address: '742 Craft Lane, Portland, OR',
        bio: 'Ceramist and eco-friendly home goods artisan with 10+ years experience.',
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
        reset_token_hash: null,
        reset_token_expires: null,
        refresh_token_hash: null,
        two_factor_secret: null,
        two_factor_enabled: false,
        created_at: now,
        updated_at: now,
      });
    } else {
      if (!existingDemoSeller.business_type) existingDemoSeller.business_type = 'Retailer';
      if (!existingDemoSeller.shop_id) existingDemoSeller.shop_id = 'RTL-10024';
    }

    // Ensure pending seller exists for realistic super admin verification tests
    const existingPendingSeller = users.find((u) => u.email === 'craftsman@greenworks.io');
    if (!existingPendingSeller) {
      users.push({
        id: 'usr_pending_seller_1',
        name: 'Marcus Vance',
        email: 'craftsman@greenworks.io',
        password_hash: defaultPasswordHash,
        role: 'seller',
        seller_status: 'pending',
        business_type: 'Wholesaler',
        shop_id: 'WHS-10085',
        store_name: 'GreenWorks Woodcraft',
        store_description: 'Reclaimed teak and bamboo minimalist kitchen accessories.',
        phone: '+1 (555) 456-7890',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        address: '89 Timber Ridge, Seattle, WA',
        bio: 'Sustainable woodturner and furniture designer awaiting merchant certification.',
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
        reset_token_hash: null,
        reset_token_expires: null,
        refresh_token_hash: null,
        two_factor_secret: null,
        two_factor_enabled: false,
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      });
    } else {
      if (!existingPendingSeller.business_type) existingPendingSeller.business_type = 'Wholesaler';
      if (!existingPendingSeller.shop_id) existingPendingSeller.shop_id = 'WHS-10085';
    }

    // Ensure all sellers have a unique Shop ID assigned
    for (const u of users) {
      if (u.role === 'seller' && !u.shop_id) {
        u.shop_id = generateShopId(u.business_type || 'Retailer');
      }
    }

    // Ensure all customers/buyers have a sequential Customer ID assigned (CUST-10001, CUST-10002, ...)
    let highestCustSeq = 10000;
    for (const u of users) {
      if (u.role === 'buyer' && u.customer_id && u.customer_id.startsWith('CUST-')) {
        const parts = u.customer_id.split('-');
        if (parts.length === 2) {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > highestCustSeq) {
            highestCustSeq = num;
          }
        }
      }
    }

    for (const u of users) {
      if (u.role === 'buyer' && !u.customer_id) {
        highestCustSeq++;
        u.customer_id = `CUST-${highestCustSeq}`;
      }
    }

    // Save updated users
    saveUsersToDisk();

    // 2. Products Initialization
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      products = JSON.parse(data);
    } else {
      products = [
        {
          id: 'prod_101',
          seller_id: 'usr_demo_seller',
          seller_name: 'Artisan Haven Studio',
          title: 'Handcrafted Ceramic Teapot Set',
          description: 'Matte teal ceramic teapot with 4 companion cups and bamboo serving tray.',
          price: 89.99,
          category: 'Home & Kitchen',
          stock: 24,
          status: 'active',
          image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
          created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'prod_102',
          seller_id: 'usr_demo_seller',
          seller_name: 'Artisan Haven Studio',
          title: 'Handmade Stoneware Pour-Over Dripper',
          description: 'Custom ribbed interior designed for balanced coffee extraction with walnut base ring.',
          price: 45.0,
          category: 'Coffee & Tea',
          stock: 15,
          status: 'active',
          image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
          created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'prod_103',
          seller_id: 'usr_demo_seller',
          seller_name: 'Artisan Haven Studio',
          title: 'Glazed Terracotta Planter with Saucer',
          description: 'Breathable natural clay planter with drainage hole and matching glazed saucer.',
          price: 34.5,
          category: 'Garden & Living',
          stock: 40,
          status: 'active',
          image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
          created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
      ];
      saveProductsToDisk();
    }

    // 3. Orders Initialization
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      orders = JSON.parse(data);
    } else {
      orders = [
        {
          id: 'ord_901',
          buyer_id: 'usr_demo_buyer',
          buyer_name: 'Alex Merchant',
          items: [
            {
              product_id: 'prod_101',
              title: 'Handcrafted Ceramic Teapot Set',
              quantity: 1,
              price: 89.99,
              seller_id: 'usr_demo_seller',
            },
          ],
          total_amount: 89.99,
          status: 'completed',
          created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'ord_902',
          buyer_id: 'usr_demo_buyer',
          buyer_name: 'Alex Merchant',
          items: [
            {
              product_id: 'prod_102',
              title: 'Handmade Stoneware Pour-Over Dripper',
              quantity: 2,
              price: 45.0,
              seller_id: 'usr_demo_seller',
            },
          ],
          total_amount: 90.0,
          status: 'completed',
          created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
      ];
      saveOrdersToDisk();
    }
  } catch (err) {
    console.error('Error initializing data storage:', err);
  }
}

// Initialize on module load
ensureStorage();

export const db = {
  // User queries
  findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === normalized);
  },

  findUserByEmailAndRole(email: string, role: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === normalized && u.role === role);
  },

  findUserByPhone(phone: string): User | undefined {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').trim();
    return users.find((u) => u.phone && u.phone.replace(/[\s\-\(\)]/g, '').trim() === cleanPhone);
  },

  findUserByPhoneAndRole(phone: string, role: string): User | undefined {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').trim();
    return users.find(
      (u) => u.role === role && u.phone && u.phone.replace(/[\s\-\(\)]/g, '').trim() === cleanPhone
    );
  },

  findUserById(id: string): User | undefined {
    return users.find((u) => u.id === id);
  },

  findUserByVerificationToken(token: string): User | undefined {
    return users.find((u) => u.verification_token === token);
  },

  findUserByResetTokenHash(tokenHash: string): User | undefined {
    return users.find((u) => u.reset_token_hash === tokenHash);
  },

  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    // Auto-generate unique Shop ID for seller accounts
    let shop_id = userData.shop_id;
    if (userData.role === 'seller' && !shop_id) {
      shop_id = generateShopId(userData.business_type || 'Retailer');
    }

    // Auto-generate sequential Customer ID for buyer accounts (CUST-10001, CUST-10002, ...)
    let customer_id = userData.customer_id;
    if (userData.role === 'buyer' && !customer_id) {
      customer_id = generateCustomerId();
    }

    const newUser: User = {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      id,
      shop_id,
      customer_id,
      seller_status: userData.role === 'seller' ? (userData.seller_status || 'pending') : undefined,
      created_at: now,
      updated_at: now,
    };
    users.push(newUser);
    saveUsersToDisk();
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    const existing = users[index];
    let shop_id = updates.shop_id !== undefined ? updates.shop_id : existing.shop_id;
    if ((updates.role === 'seller' || existing.role === 'seller') && !shop_id) {
      shop_id = generateShopId(updates.business_type || existing.business_type || 'Retailer');
    }

    let customer_id = updates.customer_id !== undefined ? updates.customer_id : existing.customer_id;
    if ((updates.role === 'buyer' || existing.role === 'buyer') && !customer_id) {
      customer_id = generateCustomerId();
    }

    users[index] = {
      ...existing,
      ...updates,
      shop_id,
      customer_id,
      updated_at: new Date().toISOString(),
    };
    saveUsersToDisk();
    return users[index];
  },

  getAllUsers(): User[] {
    return [...users];
  },

  // Customer specific queries
  getAllCustomers(): Array<
    Omit<User, 'password_hash' | 'two_factor_secret' | 'two_factor_temp_secret' | 'reset_token_hash'> & {
      orderCount: number;
      totalSpent: number;
    }
  > {
    const buyers = users.filter((u) => u.role === 'buyer');
    return buyers.map((buyer) => {
      const buyerOrders = orders.filter((o) => o.buyer_id === buyer.id);
      const totalSpent = buyerOrders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0);

      const { password_hash, two_factor_secret, two_factor_temp_secret, reset_token_hash, ...safeBuyer } = buyer;
      return {
        ...safeBuyer,
        customer_id: buyer.customer_id || 'CUST-10001',
        orderCount: buyerOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
      };
    });
  },

  // Seller specific queries
  getAllSellers(): Array<
    Omit<User, 'password_hash' | 'two_factor_secret' | 'two_factor_temp_secret' | 'reset_token_hash'> & {
      productCount: number;
      totalSalesAmount: number;
    }
  > {
    const sellers = users.filter((u) => u.role === 'seller');
    return sellers.map((seller) => {
      const sellerProducts = products.filter((p) => p.seller_id === seller.id);
      
      // Calculate total sales amount for seller
      let totalSales = 0;
      for (const order of orders) {
        if (order.status === 'completed') {
          for (const item of order.items) {
            if (item.seller_id === seller.id) {
              totalSales += item.price * item.quantity;
            }
          }
        }
      }

      const { password_hash, two_factor_secret, two_factor_temp_secret, reset_token_hash, ...safeSeller } = seller;
      return {
        ...safeSeller,
        seller_status: seller.seller_status || 'pending',
        productCount: sellerProducts.length,
        totalSalesAmount: Number(totalSales.toFixed(2)),
      };
    });
  },

  updateSellerStatus(id: string, status: 'approved' | 'suspended' | 'rejected' | 'pending' | 'unverified' | 'need_docs'): User | undefined {
    const seller = users.find((u) => u.id === id && u.role === 'seller');
    if (!seller) return undefined;

    seller.seller_status = status;
    seller.updated_at = new Date().toISOString();
    saveUsersToDisk();
    return seller;
  },

  transferSellerRole(id: string, newBusinessType: 'Retailer' | 'Wholesaler' | 'Importer' | string): User | undefined {
    const seller = users.find((u) => u.id === id && u.role === 'seller');
    if (!seller) return undefined;

    seller.business_type = newBusinessType;
    seller.shop_id = generateShopId(newBusinessType);
    seller.updated_at = new Date().toISOString();
    saveUsersToDisk();
    return seller;
  },

  lockSellerAccount(id: string, is_locked: boolean, reason?: string): User | undefined {
    const seller = users.find((u) => u.id === id && u.role === 'seller');
    if (!seller) return undefined;

    seller.is_locked = is_locked;
    if (reason !== undefined) seller.lock_reason = reason;
    seller.updated_at = new Date().toISOString();
    saveUsersToDisk();
    return seller;
  },

  updateSellerAdmin(id: string, data: Partial<User> & { present_address?: string; permanent_address?: string }): User | undefined {
    const seller = users.find((u) => u.id === id && u.role === 'seller');
    if (!seller) return undefined;

    if (data.name !== undefined) seller.name = data.name;
    if (data.store_name !== undefined) seller.store_name = data.store_name;
    if (data.email !== undefined) seller.email = data.email.toLowerCase().trim();
    if (data.phone !== undefined) seller.phone = data.phone;
    if (data.address !== undefined) seller.address = data.address;
    if (data.bio !== undefined) seller.bio = data.bio;
    if (data.store_description !== undefined) seller.store_description = data.store_description;
    if (data.seller_status !== undefined) seller.seller_status = data.seller_status;
    if (data.is_locked !== undefined) seller.is_locked = data.is_locked;
    if (data.lock_reason !== undefined) seller.lock_reason = data.lock_reason;

    if (data.present_address !== undefined || data.permanent_address !== undefined) {
      if (!seller.kyc_data) {
        seller.kyc_data = {};
      }
      if (data.present_address !== undefined) {
        seller.kyc_data.present_address = data.present_address;
        seller.address = data.present_address;
      }
      if (data.permanent_address !== undefined) {
        seller.kyc_data.permanent_address = data.permanent_address;
      }
    }

    if (data.business_type !== undefined && data.business_type !== seller.business_type) {
      seller.business_type = data.business_type;
      if (!data.shop_id) {
        seller.shop_id = generateShopId(data.business_type);
      }
    }
    if (data.shop_id !== undefined && data.shop_id.trim()) {
      seller.shop_id = data.shop_id.trim();
    }

    seller.updated_at = new Date().toISOString();
    saveUsersToDisk();
    return seller;
  },

  deleteSellerAccount(id: string): boolean {
    const index = users.findIndex((u) => u.id === id && u.role === 'seller');
    if (index === -1) return false;
    users.splice(index, 1);
    saveUsersToDisk();
    return true;
  },

  addUserNotification(userId: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (!user.notifications) user.notifications = [];
    user.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    });
    saveUsersToDisk();
  },

  notifyAdmins(
    title: string,
    message: string,
    category: 'verification' | 'order' | 'alert' | 'payment' = 'verification',
    targetView: string = 'seller-verification'
  ) {
    const adminUsers = users.filter((u) => u.role === 'admin');
    const now = new Date().toISOString();
    adminUsers.forEach((admin) => {
      if (!admin.notifications) admin.notifications = [];
      admin.notifications.unshift({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title,
        description: message,
        message,
        time: 'Just now',
        unread: true,
        category,
        targetView,
        created_at: now,
      } as any);
    });
    saveUsersToDisk();
  },

  updateUserKyc(id: string, kycData: KycData): User | undefined {
    const user = users.find((u) => u.id === id);
    if (!user) return undefined;

    user.kyc_data = {
      ...(user.kyc_data || {}),
      ...kycData,
      submitted_at: kycData.submitted_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    user.seller_status = 'pending';
    user.updated_at = new Date().toISOString();
    saveUsersToDisk();
    return user;
  },

  // Admin stats
  getAdminOverviewStats() {
    const sellerCount = users.filter((u) => u.role === 'seller').length;
    const buyerCount = users.filter((u) => u.role === 'buyer').length;

    // Count pending verifications: unverified users or sellers with pending status
    const pendingSellers = users.filter((u) => u.role === 'seller' && (u.seller_status === 'pending' || !u.seller_status)).length;
    const unverifiedUsers = users.filter((u) => !u.is_verified).length;
    const pendingVerifications = pendingSellers + unverifiedUsers;

    // Total sales across completed orders
    const totalSales = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.total_amount, 0);

    return {
      totalSales: Number(totalSales.toFixed(2)),
      sellerCount,
      buyerCount,
      pendingVerifications,
      breakdown: {
        pendingSellers,
        unverifiedUsers,
        approvedSellers: users.filter((u) => u.role === 'seller' && u.seller_status === 'approved').length,
        suspendedSellers: users.filter((u) => u.role === 'seller' && u.seller_status === 'suspended').length,
        totalProducts: products.length,
        totalOrders: orders.length,
      },
    };
  },

  // Seller products & stats
  getAllProducts(): Product[] {
    return [...products];
  },

  getProductsBySellerId(sellerId: string): Product[] {
    return products.filter((p) => p.seller_id === sellerId);
  },

  createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      created_at: now,
      updated_at: now,
    };
    products.unshift(newProduct);
    saveProductsToDisk();
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    products[index] = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveProductsToDisk();
    return products[index];
  },

  deleteProduct(id: string, sellerId: string): boolean {
    const index = products.findIndex((p) => p.id === id && p.seller_id === sellerId);
    if (index === -1) return false;
    products.splice(index, 1);
    saveProductsToDisk();
    return true;
  },

  deleteProductAdmin(id: string): boolean {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    saveProductsToDisk();
    return true;
  },

  getSellerOverviewStats(sellerId: string) {
    const sellerProducts = products.filter((p) => p.seller_id === sellerId);
    const activeProducts = sellerProducts.filter((p) => p.status === 'active').length;
    const totalProducts = sellerProducts.length;

    let totalEarnings = 0;
    let totalOrdersCount = 0;
    let pendingOrdersCount = 0;
    const recentOrders: Array<{
      orderId: string;
      date: string;
      buyerName: string;
      itemsCount: number;
      amount: number;
      status: string;
    }> = [];

    for (const order of orders) {
      const sellerItems = order.items.filter((item) => item.seller_id === sellerId);
      if (sellerItems.length > 0) {
        totalOrdersCount++;
        const sellerOrderTotal = sellerItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

        if (order.status === 'completed') {
          totalEarnings += sellerOrderTotal;
        } else if (order.status === 'pending' || order.status === 'processing') {
          pendingOrdersCount++;
        }

        recentOrders.push({
          orderId: order.id,
          date: order.created_at,
          buyerName: order.buyer_name,
          itemsCount: sellerItems.reduce((acc, it) => acc + it.quantity, 0),
          amount: Number(sellerOrderTotal.toFixed(2)),
          status: order.status,
        });
      }
    }

    const sellerUser = users.find((u) => u.id === sellerId);

    return {
      totalEarnings: Number(totalEarnings.toFixed(2)),
      activeProducts,
      totalProducts,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      sellerStatus: sellerUser?.seller_status || 'pending',
      storeName: sellerUser?.store_name || sellerUser?.name,
      shopId: sellerUser?.shop_id,
      businessType: sellerUser?.business_type,
      recentOrders: recentOrders.slice(0, 5),
    };
  },

  getAllOrders(): Order[] {
    return orders.map((o) => {
      const buyer = users.find((u) => u.id === o.buyer_id);
      return {
        ...o,
        buyer_customer_id: o.buyer_customer_id || buyer?.customer_id || 'CUST-10001',
      };
    });
  },

  updateOrderStatus(orderId: string, status: Order['status']): Order | undefined {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.status = status;
    order.updated_at = new Date().toISOString();
    saveOrdersToDisk();
    return order;
  },
};

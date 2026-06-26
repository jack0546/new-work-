
export type Category = 'Handbags' | 'Tote Bags' | 'Clutch Bags' | 'Shoulder Bags' | 'High Heels' | 'Sandals';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  discountPrice?: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  dateAdded: string;
  isTrending?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    region: string;
  };
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  date: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  wishlist: string[]; // product IDs
  orders: string[]; // order IDs
}

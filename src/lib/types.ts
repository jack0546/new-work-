
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
  status: 'pending' | 'processing' | 'delivered';
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    region: string;
  };
  date: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  wishlist: string[]; // product IDs
  orders: string[]; // order IDs
}

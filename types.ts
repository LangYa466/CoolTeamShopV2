export interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string;
  content: string;
  image: string;
  delivery_info: string;
  card_count: number;
  category?: Category;
}

export interface Order {
  order_no: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price?: number;
  total_price: number;
  pay_type?: string;
  contact?: string;
  contact_qq: string;
  status: 'pending' | 'paid';
  cards: string[];
  trade_no?: string;
  created_at: string;
  paid_at?: string;
}

export interface OrderCreationResult {
  order_no: string;
  query_password: string;
  total_price: number;
  pay_url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string; // For login
  url?: string; // For upload
  count?: number; // For add cards
}

export interface NoticeResponse {
  success: boolean;
  data: string;
}

export enum PayType {
  ALIPAY = 'alipay',
  WXPAY = 'wxpay',
  QQPAY = 'qqpay',
  BANK = 'bank',
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  features: string;
  price: number;
  cutPrice: number;
  discount: number;
  availability: "available" | "out_of_stock";
  categoryId: string;
  photos: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: "cod" | "online";
  paymentProof?: string;
  status: "pending" | "accepted" | "cancelled";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPhoto: string;
  productFeatures: string;
  price: number;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  customerId: string;
  senderRole: "customer" | "owner";
  text: string;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  type: "image" | "video";
  data: string;
  createdAt: string;
}

export interface AppSettings {
  phone: string;
  email: string;
  paymentQR: string;
  ownerPassword: string;
  ownerNames: string[];
  theme: string;
}

export type Screen =
  | "splash"
  | "welcome"
  | "customer_login"
  | "customer_dashboard"
  | "product_detail"
  | "cart"
  | "checkout_step1"
  | "checkout_step2"
  | "customer_chat"
  | "owner_login"
  | "owner_dashboard";

export type OwnerTab = "product" | "order" | "chat" | "advertisement" | "owner";

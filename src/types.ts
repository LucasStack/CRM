export type Plan = "starter" | "growth" | "scale";
export type PayMethod = "pix" | "cartao" | "boleto";
export type PayStatus = "aprovado" | "pendente" | "recusado" | "estornado";
export type PayGateway = "mercadopago" | "stripe";
export type OrderStatus = "pago" | "pendente" | "enviado" | "entregue" | "cancelado";
export type Route = "landing" | "login" | "app";
export type View =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "payments"
  | "reviews"
  | "recs"
  | "sellers"
  | "customers"
  | "billing"
  | "architecture"
  | "security";

export interface Seller {
  id: string;
  name: string;
  email: string;
  rating: number;
  sales: number;
  avatar: string;
  plan: Plan;
  city: string;
  since: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  sellerId: string;
  rating: number;
  reviewCount: number;
  image: string;
  sold: number;
  description: string;
}

export interface StockItem {
  id: string;
  productId: string;
  sellerId: string;
  quantity: number;
  reserved: number;
  warehouse: string;
}

export interface Review {
  id: string;
  productId: string;
  sellerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  idtMasked: string;
  idtHash: string;
  createdAt: string;
}

export interface Address {
  id: string;
  ownerType: "user" | "seller";
  ownerId: string;
  cep: string;
  street: string;
  city: string;
  state: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PayMethod;
  amount: number;
  status: PayStatus;
  gateway: PayGateway;
  tokenRef: string;
}

export interface OrderItem {
  productId: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  paymentId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  feePct: number;
}

export interface RevenuePoint {
  month: string;
  gmv: number;
  net: number;
}

export interface Session {
  name: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  issuedAt: number;
  accessTtlMs: number;
}

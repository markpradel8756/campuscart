export type DemoRole = 'Buyer' | 'Seller' | 'Admin'

export type Page =
  | 'marketplace'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'sell'
  | 'store'
  | 'dashboard'
  | 'products'
  | 'payouts'
  | 'reviews'
  | 'users'
  | 'vendors'
  | 'reports'

/** Every screen that has its own URL. */
export type RoutePage = Page | 'product' | 'login' | 'register' | 'admin-login' | 'not-found'

export interface Product {
  id: number
  name: string
  price: number
  category: string
  condition: string
  store: string
  image: string
  stock: number
  rating: string
}

export interface CartItem {
  product: Product
  qty: number
}

/** What is persisted for a cart line; resolved against the live product list. */
export interface CartLine {
  productId: number
  qty: number
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Ready for Pickup' | 'Completed' | 'Cancelled'

export interface Order {
  id: string
  /** Snapshot of each product at the time of purchase. */
  items: CartItem[]
  status: OrderStatus
  payment: string
  location: string
  time: string
  reviewed?: boolean
  buyerId: string
  buyerName: string
}

export type ReportStatus = 'Pending' | 'Under review' | 'Resolved'

export interface ProductReport {
  id: number
  name: string
  reason: string
  status: ReportStatus
  reporter: string
}

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected'

/** A seller (vendor) application reviewed by the demo admin. */
export interface VendorApplication {
  id: number
  /** Linked demo account, or null for seeded campus businesses. */
  accountId: string | null
  applicant: string
  email: string
  name: string
  type: string
  status: ApplicationStatus
  permit: string
  campus: string
  location: string
  category: string
  description: string
}

export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface Account {
  id: string
  name: string
  email: string
  /** Demo only. Stored in plain text in this browser, never sent anywhere. */
  password: string
  studentNumber: string
  department: string
  campus: string
  notificationsOn: boolean
  sellerStatus: SellerStatus
  storeName: string
  storeType: string
  storePayments: string
}

export interface DemoNotification {
  id: number
  text: string
  target: Page
  read: boolean
}

export interface ChatMessage {
  id: number
  text: string
  fromMe: boolean
  time: string
}

/** Per-account shopping data. */
export interface UserData {
  cart: CartLine[]
  saved: number[]
  messages: ChatMessage[]
  notifications: DemoNotification[]
}

export type Session = { kind: 'user'; accountId: string } | { kind: 'admin' } | null

export type SortOption = 'newest' | 'price-asc' | 'price-desc'

export type ModalName =
  | 'campus'
  | 'report'
  | 'product-editor'
  | 'review'
  | 'vendor-confirm'
  | 'order-success'

/** An action a guest tried to take; resumed once after sign-in. */
export type PendingIntent =
  | { type: 'add-to-cart'; productId: number; qty: number }
  | { type: 'buy-now'; productId: number; qty: number }
  | { type: 'save'; productId: number }
  | { type: 'report'; productId: number }

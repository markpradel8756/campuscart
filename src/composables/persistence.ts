import type {
  Account,
  CartItem,
  ChatMessage,
  DemoNotification,
  Order,
  Page,
  Product,
  ProductReport,
  Session,
  UserData,
  VendorApplication,
} from '../types'
import {
  createAccounts,
  createAllUserData,
  createOrders,
  createProducts,
  createReports,
  createUserData,
  createVendors,
} from '../data/demoData'

/*
 * Demo persistence. Only mock data lives here, in this browser's localStorage.
 * Anything missing, malformed, or from an older version falls back to seed data
 * field by field, so a bad value never breaks the app.
 */

export const STORAGE_KEY = 'campuscart-demo'
/** Saved data from before the CampusCart rename used this key. */
const LEGACY_KEYS = ['campus-market-demo']
const VERSION = 3

export interface PersistedState {
  products: Product[]
  orders: Order[]
  reports: ProductReport[]
  vendors: VendorApplication[]
  accounts: Account[]
  userData: Record<string, UserData>
  session: Session
}

export type LoadResult = { state: PersistedState; notice: string | null }

export function createSeedState(): PersistedState {
  const products = createProducts()
  const accounts = createAccounts()
  return {
    products,
    orders: createOrders(products),
    reports: createReports(),
    vendors: createVendors(),
    accounts,
    userData: createAllUserData(accounts),
    session: null,
  }
}

// ── tiny guards ──────────────────────────────────────────────
type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const oneOf = <T extends string>(v: unknown, list: readonly T[]): v is T => isStr(v) && (list as readonly string[]).includes(v)
const str = (v: unknown, fallback = '') => (isStr(v) ? v : fallback)

const PAGES: Page[] = ['marketplace', 'cart', 'checkout', 'orders', 'messages', 'notifications', 'profile', 'sell', 'store', 'dashboard', 'products', 'payouts', 'reviews', 'users', 'vendors', 'reports']
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled'] as const
const REPORT_STATUSES = ['Pending', 'Under review', 'Resolved'] as const
const APP_STATUSES = ['Pending', 'Approved', 'Rejected'] as const
const SELLER_STATUSES = ['none', 'pending', 'approved', 'rejected'] as const

function list<T>(v: unknown, parse: (x: unknown) => T | null): T[] | null {
  if (!Array.isArray(v)) return null
  return v.map(parse).filter((x): x is T => x !== null)
}

const parseProduct = (v: unknown): Product | null =>
  isObj(v) && isNum(v.id) && isStr(v.name) && isNum(v.price) && isStr(v.category) && isStr(v.condition) && isStr(v.store) && isStr(v.image) && isNum(v.stock)
    ? { id: v.id, name: v.name, price: v.price, category: v.category, condition: v.condition, store: v.store, image: v.image, stock: Math.max(0, Math.floor(v.stock)), rating: str(v.rating, 'New') }
    : null

const parseCartItem = (v: unknown): CartItem | null => {
  if (!isObj(v) || !isNum(v.qty)) return null
  const product = parseProduct(v.product)
  return product ? { product, qty: Math.max(1, Math.floor(v.qty)) } : null
}

const parseOrder = (v: unknown): Order | null => {
  if (!isObj(v) || !isStr(v.id) || !oneOf(v.status, ORDER_STATUSES) || !isStr(v.buyerId)) return null
  const items = list(v.items, parseCartItem)
  if (!items?.length) return null
  return { id: v.id, items, status: v.status, payment: str(v.payment, 'Cash on pickup'), location: str(v.location), time: str(v.time), reviewed: v.reviewed === true, buyerId: v.buyerId, buyerName: str(v.buyerName, 'Campus buyer') }
}

const parseReport = (v: unknown): ProductReport | null =>
  isObj(v) && isNum(v.id) && isStr(v.name) && isStr(v.reason) && oneOf(v.status, REPORT_STATUSES)
    ? { id: v.id, name: v.name, reason: v.reason, status: v.status, reporter: str(v.reporter, 'Campus member') }
    : null

const parseVendor = (v: unknown): VendorApplication | null =>
  isObj(v) && isNum(v.id) && isStr(v.name) && oneOf(v.status, APP_STATUSES)
    ? {
        id: v.id, accountId: isStr(v.accountId) ? v.accountId : null, applicant: str(v.applicant), email: str(v.email), name: v.name,
        type: str(v.type, 'Student-owned store'), status: v.status, permit: str(v.permit, 'Not required'), campus: str(v.campus, 'Main Campus'),
        location: str(v.location), category: str(v.category, 'Others'), description: str(v.description),
      }
    : null

const parseAccount = (v: unknown): Account | null =>
  isObj(v) && isStr(v.id) && isStr(v.name) && isStr(v.email) && isStr(v.password)
    ? {
        id: v.id, name: v.name, email: v.email, password: v.password, studentNumber: str(v.studentNumber), department: str(v.department, 'College of Engineering'),
        campus: str(v.campus, 'Main Campus'), notificationsOn: v.notificationsOn !== false, sellerStatus: oneOf(v.sellerStatus, SELLER_STATUSES) ? v.sellerStatus : 'none',
        storeName: str(v.storeName), storeType: str(v.storeType, 'Student-owned store'), storePayments: str(v.storePayments, 'Cash on pickup'),
      }
    : null

const parseNotification = (v: unknown): DemoNotification | null =>
  isObj(v) && isNum(v.id) && isStr(v.text) && oneOf(v.target, PAGES) ? { id: v.id, text: v.text, target: v.target, read: v.read === true } : null

const parseMessage = (v: unknown): ChatMessage | null =>
  isObj(v) && isNum(v.id) && isStr(v.text) ? { id: v.id, text: v.text, fromMe: v.fromMe === true, time: str(v.time) } : null

const parseUserData = (v: unknown): UserData | null => {
  if (!isObj(v)) return null
  return {
    cart: list(v.cart, (c) => (isObj(c) && isNum(c.productId) && isNum(c.qty) ? { productId: c.productId, qty: Math.max(1, Math.floor(c.qty)) } : null)) ?? [],
    saved: list(v.saved, (n) => (isNum(n) ? n : null)) ?? [],
    messages: list(v.messages, parseMessage) ?? createUserData().messages,
    notifications: list(v.notifications, parseNotification) ?? [],
  }
}

export function loadState(): LoadResult {
  const seed = createSeedState()
  let raw: string | null = null
  try {
    LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k))
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return { state: seed, notice: 'This browser blocks storage, so demo changes will reset on refresh.' }
  }
  if (!raw) return { state: seed, notice: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { state: seed, notice: 'Saved demo data was unreadable, so the demo was reset.' }
  }
  if (!isObj(parsed) || parsed.version !== VERSION || !isObj(parsed.data)) {
    return { state: seed, notice: 'Saved demo data was out of date, so the demo was reset.' }
  }

  const d = parsed.data
  const accounts = list(d.accounts, parseAccount)
  const state: PersistedState = {
    products: list(d.products, parseProduct) ?? seed.products,
    orders: list(d.orders, parseOrder) ?? seed.orders,
    reports: list(d.reports, parseReport) ?? seed.reports,
    vendors: list(d.vendors, parseVendor) ?? seed.vendors,
    accounts: accounts?.length ? accounts : seed.accounts,
    userData: {},
    session: null,
  }

  const savedUserData = isObj(d.userData) ? d.userData : {}
  for (const acc of state.accounts) {
    state.userData[acc.id] = parseUserData(savedUserData[acc.id]) ?? createUserData(acc.id === 'acc-jamie')
  }

  const s = d.session
  if (isObj(s) && s.kind === 'admin') state.session = { kind: 'admin' }
  else if (isObj(s) && s.kind === 'user' && isStr(s.accountId) && state.accounts.some((a) => a.id === s.accountId)) {
    state.session = { kind: 'user', accountId: s.accountId }
  }
  return { state, notice: null }
}

/** Returns false when storage is unavailable or full. */
export function saveState(state: PersistedState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, data: state }))
    return true
  } catch {
    return false
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

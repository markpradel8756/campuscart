import { computed, nextTick, reactive, ref, shallowRef, toRef, watch } from 'vue'
import type { Router } from 'vue-router'
import type {
  Account,
  CartItem,
  DemoRole,
  ModalName,
  Order,
  OrderStatus,
  Page,
  PendingIntent,
  Product,
  RoutePage,
  ProductReport,
  ReportStatus,
  SortOption,
  UserData,
  VendorApplication,
} from '../types'
import { ADMIN_DEMO, SAMPLE_PRODUCT_IMAGE, createUserData } from '../data/demoData'
import { clearState, createSeedState, loadState, saveState } from './persistence'
import { pathFor, safeRedirect } from '../router/paths'

/*
 * One shared store for the whole demo, created once at module scope so every
 * useMarketplace() call returns the same instance. Mock data is persisted to
 * localStorage (see persistence.ts). Authentication, payments and admin access
 * are simulated: nothing leaves the browser.
 */

const loaded = loadState()
const db = reactive(loaded.state)

const products = toRef(db, 'products')
const orders = toRef(db, 'orders')
const reports = toRef(db, 'reports')
const vendors = toRef(db, 'vendors')
const accounts = toRef(db, 'accounts')

// The router is the source of truth for where the visitor is (see router/index.ts).
const routerRef = shallowRef<Router | null>(null)
export function bindRouter(router: Router) {
  routerRef.value = router
}
const route = computed(() => routerRef.value?.currentRoute.value ?? null)
const currentPage = computed<RoutePage>(() => route.value?.meta.page ?? 'marketplace')
const selectedProduct = computed<Product | null>(() =>
  currentPage.value === 'product' ? db.products.find((p) => p.id === Number(route.value?.params.id)) ?? null : null,
)
const mobileMenuOpen = ref(false)
const pendingIntent = ref<PendingIntent | null>(null)
const storageWorking = ref(true)

const filters = reactive({
  search: '',
  category: 'All items',
  condition: '',
  maxPrice: '' as string | number,
  savedOnly: false,
  sort: 'newest' as SortOption,
  panelOpen: false,
})

interface ModalState {
  name: ModalName | null
  product: Product | null
  order: Order | null
  vendor: VendorApplication | null
  vendorAction: 'approve' | 'reject'
}

const modal = reactive<ModalState>({ name: null, product: null, order: null, vendor: null, vendorAction: 'approve' })

const toast = ref<{ id: number; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const nextId = (values: number[]) => values.reduce((m, v) => Math.max(m, v), 0) + 1

// ── Session & roles ──────────────────────────────────────────
const isAdmin = computed(() => db.session?.kind === 'admin')
const currentAccount = computed<Account | null>(() => {
  const s = db.session
  return s?.kind === 'user' ? db.accounts.find((a) => a.id === s.accountId) ?? null : null
})
const isSignedIn = computed(() => currentAccount.value !== null)
const isGuest = computed(() => db.session === null)
const isApprovedSeller = computed(() => currentAccount.value?.sellerStatus === 'approved')
/** Admin session → Admin view; an approved seller inside /seller → Seller view; everyone else shops. */
const role = computed<DemoRole>(() => (isAdmin.value ? 'Admin' : isApprovedSeller.value && route.value?.meta.area === 'seller' ? 'Seller' : 'Buyer'))
const storeName = computed(() => currentAccount.value?.storeName ?? '')

const EMPTY_USER: UserData = { cart: [], saved: [], messages: [], notifications: [] }
const userData = computed<UserData>(() => {
  const acc = currentAccount.value
  if (!acc) return EMPTY_USER
  if (!db.userData[acc.id]) db.userData[acc.id] = createUserData()
  return db.userData[acc.id]
})

const cart = computed<CartItem[]>(() =>
  userData.value.cart.flatMap((line) => {
    const product = db.products.find((p) => p.id === line.productId)
    return product ? [{ product, qty: Math.min(line.qty, Math.max(product.stock, 1)) }] : []
  }),
)
const savedIds = computed(() => userData.value.saved)
const messages = computed(() => userData.value.messages)
const notifications = computed(() => userData.value.notifications)

// ── Derived data ─────────────────────────────────────────────
const hasActiveFilters = computed(() => filters.condition !== '' || filters.maxPrice !== '')

const filteredProducts = computed(() => {
  const query = filters.search.trim().toLowerCase()
  const max = filters.maxPrice === '' ? null : Number(filters.maxPrice)
  const result = db.products.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query) && !p.store.toLowerCase().includes(query)) return false
    if (filters.category !== 'All items' && p.category !== filters.category) return false
    if (filters.condition && p.condition !== filters.condition) return false
    if (max !== null && !Number.isNaN(max) && p.price > max) return false
    if (filters.savedOnly && !savedIds.value.includes(p.id)) return false
    return true
  })
  if (filters.sort === 'price-asc') return [...result].sort((a, b) => a.price - b.price)
  if (filters.sort === 'price-desc') return [...result].sort((a, b) => b.price - a.price)
  return result
})

const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const cartSubtotal = computed(() => cart.value.reduce((sum, item) => sum + item.qty * item.product.price, 0))
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

const myProducts = computed(() => db.products.filter((p) => p.store === storeName.value))
const myOrders = computed(() => db.orders.filter((o) => o.buyerId === currentAccount.value?.id))
const storeOrders = computed(() => db.orders.filter((o) => o.items.some((i) => i.product.store === storeName.value)))
/** Orders shown on the Orders page for the current view. */
const visibleOrders = computed(() => (role.value === 'Admin' ? db.orders : role.value === 'Seller' ? storeOrders.value : myOrders.value))

const pendingApplications = computed(() => db.vendors.filter((v) => v.status === 'Pending').length)
const openReports = computed(() => db.reports.filter((r) => r.status !== 'Resolved').length)
const pendingOrders = computed(() => storeOrders.value.filter((o) => o.status === 'Pending').length)
const completedOrders = computed(() => storeOrders.value.filter((o) => o.status === 'Completed').length)
const lowStockProducts = computed(() => myProducts.value.filter((p) => p.stock <= 2))
const myApplication = computed(() => {
  const id = currentAccount.value?.id
  return id ? [...db.vendors].reverse().find((v) => v.accountId === id) ?? null : null
})

// ── Persistence ──────────────────────────────────────────────
let saveTimer: ReturnType<typeof setTimeout> | undefined
function flushSave() {
  clearTimeout(saveTimer)
  saveTimer = undefined
  storageWorking.value = saveState(db)
}
watch(
  db,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(flushSave, 120)
  },
  { deep: true },
)
// Never lose the last change when the tab is refreshed or closed mid-debounce.
window.addEventListener('pagehide', () => saveTimer !== undefined && flushSave())

// ── Feedback ─────────────────────────────────────────────────
function showToast(message: string) {
  clearTimeout(toastTimer)
  toast.value = { id: Date.now(), message }
  toastTimer = setTimeout(() => (toast.value = null), 4000)
}

function dismissToast() {
  clearTimeout(toastTimer)
  toast.value = null
}

if (loaded.notice) setTimeout(() => showToast(loaded.notice!), 300)

function notify(accountId: string, text: string, target: Page) {
  const data = db.userData[accountId]
  if (!data) return
  data.notifications.unshift({ id: nextId(data.notifications.map((n) => n.id)), text, target, read: false })
}

// ── Navigation & access ──────────────────────────────────────
// Access rules live in the router guards; these helpers only choose the URL.
const ADMIN_PAGES: Page[] = ['dashboard', 'users', 'vendors', 'reports', 'products', 'orders']

function push(to: Parameters<Router['push']>[0]) {
  return routerRef.value?.push(to)
}

function replace(to: Parameters<Router['replace']>[0]) {
  return routerRef.value?.replace(to)
}

/** Opens a page in the current view (a new browser history entry). */
function navigate(page: Page) {
  if (isAdmin.value && page !== 'marketplace' && !ADMIN_PAGES.includes(page)) {
    showToast('The demo admin can’t shop or message. Exit admin to browse as a buyer.')
    return
  }
  mobileMenuOpen.value = false
  push(pathFor(page, role.value))
}

/** In-app back buttons: step back through real history when it leads where expected, otherwise open the fallback. */
function goBack(fallback: string) {
  const back = (window.history.state as { back?: string | null } | null)?.back
  if (back && back.split('#')[0].split('?')[0] === fallback) routerRef.value?.back()
  else push(fallback)
}

function scrollToBrowse() {
  nextTick(() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function explore() {
  mobileMenuOpen.value = false
  if (currentPage.value === 'marketplace') scrollToBrowse()
  else push({ path: '/', hash: '#browse' })
}

/** Approved sellers switch between shopping and their seller workspace. */
function setSellerMode(on: boolean) {
  push(on ? '/seller' : '/')
}

/** Link to a sign-in page that brings the visitor back here afterwards. */
function authLocation(name: 'login' | 'register' | 'admin-login') {
  const here = route.value
  const keep = here && here.path !== '/' && !['login', 'register', 'admin-login'].includes(here.meta.page)
  const redirect = keep ? here.fullPath : here?.query.redirect
  return { name, query: typeof redirect === 'string' ? { redirect } : {} }
}

function openProduct(product: Product) {
  mobileMenuOpen.value = false
  push(`/product/${product.id}`)
}

// ── Authentication (simulated) ───────────────────────────────
/** Returns true when a buyer is signed in; otherwise remembers the intent and asks to sign in. */
function requireAuth(intent: PendingIntent): boolean {
  if (isSignedIn.value) return true
  if (isAdmin.value) {
    showToast('The demo admin can’t shop. Exit admin to browse as a buyer.')
    return false
  }
  pendingIntent.value = intent
  push({ name: 'login', query: { redirect: route.value?.fullPath ?? '/' } })
  return false
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function finishAuth(message: string, redirect: unknown) {
  const intent = pendingIntent.value
  pendingIntent.value = null
  showToast(message)
  const product = intent ? db.products.find((p) => p.id === intent.productId) : undefined
  // Replace the sign-in entry so Back doesn't return to a form the visitor already completed.
  await replace(intent?.type === 'buy-now' && product ? '/checkout' : safeRedirect(redirect))
  if (!intent || !product) return
  switch (intent.type) {
    case 'add-to-cart':
      addToCartInternal(product, intent.qty)
      break
    case 'buy-now': {
      const inCart = userData.value.cart.find((l) => l.productId === product.id)?.qty ?? 0
      if (inCart < product.stock) addToCartInternal(product, intent.qty, false)
      break
    }
    case 'save':
      // Resume as "save", never as a toggle, so a repeated intent can't un-save.
      if (!userData.value.saved.includes(product.id)) userData.value.saved.push(product.id)
      break
    case 'report':
      openModal('report', { product })
      break
  }
}

function login(email: string, password: string, redirect?: unknown): string | null {
  const e = normalizeEmail(email)
  if (e === ADMIN_DEMO.email) return 'Admin access uses the separate demo admin entry, not public sign-in.'
  const account = db.accounts.find((a) => a.email.toLowerCase() === e)
  if (!account || account.password !== password) return 'That email and password don’t match a demo account.'
  db.session = { kind: 'user', accountId: account.id }
  void finishAuth(`Welcome back, ${account.name.split(' ')[0]}! (Simulated sign-in)`, redirect)
  return null
}

interface Registration {
  name: string
  studentNumber: string
  department: string
  campus: string
  email: string
  password: string
}

function register(data: Registration, redirect?: unknown): string | null {
  const e = normalizeEmail(data.email)
  if (e === ADMIN_DEMO.email || e.endsWith('@campuscart.demo')) return 'This email is reserved for demo administration.'
  if (db.accounts.some((a) => a.email.toLowerCase() === e)) return 'An account with this email already exists. Try signing in.'
  const id = `acc-${Date.now().toString(36)}`
  // Public registration always creates a buyer. Selling requires an approved application.
  db.accounts.push({
    id, name: data.name.trim(), email: e, password: data.password, studentNumber: data.studentNumber.trim(),
    department: data.department, campus: data.campus, notificationsOn: true, sellerStatus: 'none',
    storeName: '', storeType: 'Student-owned store', storePayments: 'Cash on pickup',
  })
  db.userData[id] = createUserData()
  db.session = { kind: 'user', accountId: id }
  void finishAuth('Demo account created. No verification email was sent.', redirect)
  return null
}

function adminLogin(email: string, password: string, redirect?: unknown): string | null {
  if (normalizeEmail(email) !== ADMIN_DEMO.email || password !== ADMIN_DEMO.password) return 'Use the demo admin credentials shown below.'
  pendingIntent.value = null
  db.session = { kind: 'admin' }
  const target = safeRedirect(redirect, '/admin')
  void replace(target.startsWith('/admin') ? target : '/admin')
  showToast('Signed in to the demo admin. This access is simulated.')
  return null
}

function logout() {
  const wasAdmin = isAdmin.value
  db.session = null
  filters.savedOnly = false
  push('/')
  showToast(wasAdmin ? 'You left the demo admin.' : 'You’re signed out of the demo.')
}

function updateAccount(changes: Partial<Account>): string | null {
  const acc = currentAccount.value
  if (!acc) return 'Please sign in first.'
  if (changes.email) {
    const e = normalizeEmail(changes.email)
    if (e === ADMIN_DEMO.email) return 'This email is reserved for demo administration.'
    if (db.accounts.some((a) => a.id !== acc.id && a.email.toLowerCase() === e)) return 'Another demo account already uses this email.'
    changes.email = e
  }
  const oldStore = acc.storeName
  Object.assign(acc, changes)
  // Keep listings and the application linked when an approved seller renames the store.
  if (changes.storeName && oldStore && changes.storeName !== oldStore) {
    db.products.forEach((p) => p.store === oldStore && (p.store = changes.storeName!))
    db.vendors.forEach((v) => v.accountId === acc.id && (v.name = changes.storeName!))
  }
  return null
}

// ── Shopping ─────────────────────────────────────────────────
function toggleSaved(id: number) {
  if (!requireAuth({ type: 'save', productId: id })) return
  const saved = userData.value.saved
  const index = saved.indexOf(id)
  if (index === -1) saved.push(id)
  else saved.splice(index, 1)
}

function resetFilters() {
  filters.condition = ''
  filters.maxPrice = ''
}

function showAllProducts() {
  filters.search = ''
  filters.category = 'All items'
  filters.condition = ''
  filters.maxPrice = ''
  filters.savedOnly = false
}

function addToCartInternal(product: Product, qty: number, announce = true) {
  const lines = userData.value.cart
  const existing = lines.find((l) => l.productId === product.id)
  const current = existing?.qty ?? 0
  const nextQty = Math.min(product.stock, current + qty)
  const added = nextQty - current
  if (added <= 0) {
    if (announce) showToast(product.stock < 1 ? 'This find is currently unavailable.' : `You already have all ${product.stock} available in your cart.`)
    return 0
  }
  if (existing) existing.qty = nextQty
  else lines.push({ productId: product.id, qty: nextQty })
  if (announce) showToast(added < qty ? `Added ${added}. Only ${product.stock} available from this seller.` : 'Added to your cart.')
  return added
}

/** Adds to the cart, merging with an existing line. Returns the quantity actually added. */
function addToCart(product: Product, qty = 1) {
  if (!requireAuth({ type: 'add-to-cart', productId: product.id, qty })) return 0
  return addToCartInternal(product, qty)
}

function buyNow(product: Product, qty = 1) {
  if (!requireAuth({ type: 'buy-now', productId: product.id, qty })) return
  const inCart = userData.value.cart.find((l) => l.productId === product.id)?.qty ?? 0
  if (inCart < product.stock) addToCartInternal(product, qty, false)
  push('/checkout')
}

function updateCartQty(productId: number, qty: number) {
  const line = userData.value.cart.find((l) => l.productId === productId)
  const product = db.products.find((p) => p.id === productId)
  if (!line || !product) return
  line.qty = Math.max(1, Math.min(product.stock, qty))
}

function removeFromCart(productId: number) {
  const lines = userData.value.cart
  const index = lines.findIndex((l) => l.productId === productId)
  if (index !== -1) lines.splice(index, 1)
}

function placeOrder(payment: string, location: string, time: string) {
  const acc = currentAccount.value
  if (!acc) return []
  const byStore = new Map<string, CartItem[]>()
  for (const item of cart.value) {
    const group = byStore.get(item.product.store) ?? []
    group.push({ product: { ...item.product }, qty: item.qty })
    byStore.set(item.product.store, group)
  }
  let n = nextId(db.orders.map((o) => Number(o.id.replace(/\D/g, '')) || 0))
  const created: Order[] = [...byStore.values()].map((items) => ({
    id: `CM-${n++}`, items, status: 'Pending', payment, location, time, buyerId: acc.id, buyerName: acc.name,
  }))
  db.orders.unshift(...created)
  userData.value.cart.splice(0)
  notify(acc.id, `Your sample order${created.length > 1 ? 's' : ''} ${created.map((o) => o.id).join(', ')} ${created.length > 1 ? 'were' : 'was'} placed.`, 'orders')
  // Checkout is finished, so its history entry becomes the order list; Back won't reopen an empty checkout.
  void Promise.resolve(replace('/orders')).then(() => openModal('order-success'))
  return created
}

const STATUS_NOTES: Partial<Record<OrderStatus, string>> = {
  Confirmed: 'was confirmed by the seller.',
  'Ready for Pickup': 'is ready for pickup.',
  Cancelled: 'was cancelled.',
}

function setOrderStatus(order: Order, status: OrderStatus, message: string) {
  order.status = status
  const note = STATUS_NOTES[status]
  if (note && order.buyerId !== currentAccount.value?.id) notify(order.buyerId, `Your order ${order.id} ${note}`, 'orders')
  showToast(message)
}

// ── Modals ───────────────────────────────────────────────────
function openModal(name: ModalName, payload: Partial<Omit<ModalState, 'name'>> = {}) {
  modal.product = payload.product ?? null
  modal.order = payload.order ?? null
  modal.vendor = payload.vendor ?? null
  modal.vendorAction = payload.vendorAction ?? 'approve'
  modal.name = name
  mobileMenuOpen.value = false
}

function closeModal() {
  modal.name = null
}

// ── Seller tools ─────────────────────────────────────────────
interface SellerApplicationInput {
  name: string
  type: string
  category: string
  location: string
  permit: string
  description: string
}

function submitApplication(input: SellerApplicationInput) {
  const acc = currentAccount.value
  if (!acc) return
  db.vendors.push({
    id: nextId(db.vendors.map((v) => v.id)), accountId: acc.id, applicant: acc.name, email: acc.email, name: input.name.trim(),
    type: input.type, status: 'Pending', permit: input.permit.trim() || 'Not required', campus: acc.campus,
    location: input.location, category: input.category, description: input.description.trim(),
  })
  acc.sellerStatus = 'pending'
  acc.storeName = input.name.trim()
  acc.storeType = input.type
  showToast('Application submitted. A campus admin will review it (simulated).')
}

function decideApplication(app: VendorApplication, status: 'Approved' | 'Rejected') {
  app.status = status
  const acc = app.accountId ? db.accounts.find((a) => a.id === app.accountId) : null
  if (acc) {
    acc.sellerStatus = status === 'Approved' ? 'approved' : 'rejected'
    if (status === 'Approved') acc.storeName = app.name
    notify(acc.id, status === 'Approved' ? `Your store “${app.name}” was approved. Seller tools are unlocked!` : `Your seller application for “${app.name}” wasn’t approved this time.`, 'sell')
  }
  showToast(status === 'Approved' ? `${app.name} was approved (simulated).` : `${app.name}'s application was rejected (simulated).`)
}

function saveProduct(data: Omit<Product, 'id' | 'store' | 'image' | 'rating'>, editing: Product | null) {
  if (editing) {
    Object.assign(editing, data)
    showToast('Your listing has been updated.')
  } else {
    db.products.unshift({ ...data, id: nextId(db.products.map((p) => p.id)), store: storeName.value, image: SAMPLE_PRODUCT_IMAGE, rating: 'New' })
    showToast('Your find is live on CampusCart (demo).')
  }
}

// ── Reports & messages ───────────────────────────────────────
function addReport(name: string, reason: string) {
  db.reports.push({ id: nextId(db.reports.map((r) => r.id)), name, reason, status: 'Pending', reporter: currentAccount.value?.name ?? 'Campus member' })
  showToast('Thank you. Your report was sent to the campus admin team (demo).')
}

function setReportStatus(report: ProductReport, status: ReportStatus) {
  report.status = status
  showToast(status === 'Resolved' ? 'Report resolved.' : 'Report marked under review.')
}

function sendMessage(text: string) {
  const list = userData.value.messages
  list.push({ id: nextId(list.map((m) => m.id)), text, fromMe: true, time: 'Sent · just now' })
}

function markAllRead() {
  notifications.value.forEach((n) => (n.read = true))
}

function resetDemo() {
  clearState()
  Object.assign(db, createSeedState())
  showAllProducts()
  pendingIntent.value = null
  modal.name = null
  replace('/')
  showToast('Demo data was reset to its starting state.')
}

export function useMarketplace() {
  return {
    // state
    products, cart, orders, reports, vendors, accounts, notifications, messages, savedIds,
    role, currentPage, selectedProduct, mobileMenuOpen, filters, modal, toast, pendingIntent, storageWorking,
    // session
    currentAccount, isSignedIn, isGuest, isAdmin, isApprovedSeller, storeName, myApplication,
    // computed
    hasActiveFilters, filteredProducts, cartCount, cartSubtotal, unreadCount, pendingApplications, openReports,
    pendingOrders, completedOrders, lowStockProducts, myProducts, myOrders, storeOrders, visibleOrders,
    // actions
    showToast, dismissToast, navigate, goBack, authLocation, explore, scrollToBrowse, setSellerMode, openProduct, requireAuth,
    login, register, adminLogin, logout, updateAccount, toggleSaved, resetFilters, showAllProducts, addToCart,
    buyNow, updateCartQty, removeFromCart, placeOrder, setOrderStatus, openModal, closeModal, submitApplication,
    decideApplication, saveProduct, addReport, setReportStatus, sendMessage, markAllRead, resetDemo,
  }
}

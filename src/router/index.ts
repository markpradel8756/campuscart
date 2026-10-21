import { createRouter, createWebHistory } from 'vue-router'
import type { RouteComponent, RouteLocationRaw, RouteRecordRaw } from 'vue-router'
import type { Page, RoutePage } from '../types'
import { safeRedirect } from './paths'
import { useMarketplace } from '../composables/useMarketplace'
import MarketplaceView from '../views/MarketplaceView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import AuthView from '../views/AuthView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrdersView from '../views/OrdersView.vue'
import MessagesView from '../views/MessagesView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ProfileView from '../views/ProfileView.vue'
import SellView from '../views/SellView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProductsView from '../views/ProductsView.vue'
import PayoutsView from '../views/PayoutsView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import UsersView from '../views/UsersView.vue'
import VendorApprovalsView from '../views/VendorApprovalsView.vue'
import ProductReportsView from '../views/ProductReportsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

/** Who may open a route. Guards redirect everyone else. */
type Access = 'public' | 'guest' | 'buyer' | 'seller' | 'admin'

declare module 'vue-router' {
  interface RouteMeta {
    page: RoutePage
    title: string
    access: Access
    /** full = page draws its own container; content = standard page; workspace = sidebar layout */
    layout: 'full' | 'content' | 'workspace'
    /** Which workspace a route belongs to. Decides the Seller/Admin view. */
    area?: 'seller' | 'admin'
  }
}

const buyer = (path: string, page: Page, title: string, component: RouteComponent, layout: 'full' | 'content' = 'content', props?: object): RouteRecordRaw => ({
  path, name: page, component, props, meta: { page, title, access: 'buyer', layout },
})
const seller = (path: string, page: Page, title: string, component: RouteComponent, props?: object, access: Access = 'seller'): RouteRecordRaw => ({
  path, name: `seller-${page}`, component, props, meta: { page, title, access, layout: 'workspace', area: 'seller' },
})
const admin = (path: string, page: Page, title: string, component: RouteComponent): RouteRecordRaw => ({
  path, name: `admin-${page}`, component, meta: { page, title, access: 'admin', layout: 'workspace', area: 'admin' },
})

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'marketplace', component: MarketplaceView, meta: { page: 'marketplace', title: '', access: 'public', layout: 'full' } },
  {
    path: '/product/:id(\\d+)', name: 'product', component: ProductDetailView, props: (r) => ({ id: Number(r.params.id) }),
    meta: { page: 'product', title: 'Product', access: 'public', layout: 'full' },
  },
  { path: '/login', name: 'login', component: AuthView, props: { mode: 'login' }, meta: { page: 'login', title: 'Sign in', access: 'guest', layout: 'content' } },
  { path: '/register', name: 'register', component: AuthView, props: { mode: 'register' }, meta: { page: 'register', title: 'Create an account', access: 'guest', layout: 'content' } },
  { path: '/admin/login', name: 'admin-login', component: AuthView, props: { mode: 'admin' }, meta: { page: 'admin-login', title: 'Demo admin access', access: 'guest', layout: 'content' } },
  { path: '/sell', name: 'sell', component: SellView, meta: { page: 'sell', title: 'Become a seller', access: 'public', layout: 'content' } },

  buyer('/cart', 'cart', 'Your cart', CartView, 'full'),
  buyer('/checkout', 'checkout', 'Checkout', CheckoutView, 'full'),
  buyer('/orders', 'orders', 'My orders', OrdersView),
  buyer('/messages', 'messages', 'Messages', MessagesView),
  buyer('/notifications', 'notifications', 'Notifications', NotificationsView),
  buyer('/profile', 'profile', 'Profile & settings', ProfileView, 'content', { mode: 'profile' }),

  seller('/seller', 'dashboard', 'Seller dashboard', DashboardView),
  seller('/seller/store', 'store', 'Your campus store', ProfileView, { mode: 'store' }),
  seller('/seller/products', 'products', 'Product management', ProductsView),
  seller('/seller/orders', 'orders', 'Order management', OrdersView),
  seller('/seller/messages', 'messages', 'Messages', MessagesView),
  seller('/seller/notifications', 'notifications', 'Notifications', NotificationsView),
  seller('/seller/payouts', 'payouts', 'Your payouts', PayoutsView),
  seller('/seller/reviews', 'reviews', 'Reviews', ReviewsView),
  seller('/seller/settings', 'profile', 'Settings', ProfileView, { mode: 'profile' }),

  admin('/admin', 'dashboard', 'Admin overview', DashboardView),
  admin('/admin/users', 'users', 'Campus users', UsersView),
  admin('/admin/applications', 'vendors', 'Seller applications', VendorApprovalsView),
  admin('/admin/reports', 'reports', 'Product reports', ProductReportsView),
  admin('/admin/products', 'products', 'Marketplace products', ProductsView),
  admin('/admin/orders', 'orders', 'All orders', OrdersView),

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { page: 'not-found', title: 'Page not found', access: 'public', layout: 'content' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Back/Forward restore where the visitor was; new pages start at the top.
    // 'instant' overrides the stylesheet's smooth scrolling so restored positions are exact.
    if (savedPosition) {
      // Wait a frame so the restored page has its full height before scrolling.
      return new Promise((resolve) => requestAnimationFrame(() => resolve({ ...savedPosition, behavior: 'instant' })))
    }
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 12 }
    if (to.path === from.path) return false
    return { top: 0, behavior: 'instant' }
  },
})

router.beforeEach((to): RouteLocationRaw | true => {
  const store = useMarketplace()
  const { access } = to.meta
  const toLogin = { name: 'login', query: { redirect: to.fullPath } }

  if (access === 'guest') {
    if (store.isAdmin.value) return { path: '/admin' }
    // Signed-in buyers may still open the separate demo admin entry (it switches accounts).
    if (store.isSignedIn.value && to.meta.page !== 'admin-login') return safeRedirect(to.query.redirect)
    return true
  }
  if (access === 'admin') return store.isAdmin.value ? true : { name: 'admin-login', query: { redirect: to.fullPath } }
  if (store.isAdmin.value && access !== 'public') {
    store.showToast('The demo admin can’t shop or message. Exit admin to browse as a buyer.')
    return { path: '/admin' }
  }
  if (access === 'buyer' && !store.isSignedIn.value) return toLogin
  if (access === 'seller') {
    if (!store.isSignedIn.value) return toLogin
    if (!store.isApprovedSeller.value) return { path: '/sell' }
  }
  return true
})

router.afterEach((to, from) => {
  const store = useMarketplace()
  store.mobileMenuOpen.value = false
  // Leaving the sign-in pages without signing in abandons the guest's pending action.
  if (!['login', 'register'].includes(to.meta.page)) store.pendingIntent.value = null
  if (from.matched.length && to.fullPath !== from.fullPath) store.closeModal()
  const product = to.meta.page === 'product' ? store.products.value.find((p) => p.id === Number(to.params.id)) : undefined
  const title = product?.name ?? to.meta.title
  document.title = title ? `${title} · CampusCart` : 'CampusCart · Your campus marketplace'
})

export default router

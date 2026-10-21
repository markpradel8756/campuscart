import type { DemoRole, Page } from '../types'

/** The URL for a page in a given view, e.g. Orders is /orders for buyers but /seller/orders in the seller workspace. */
export function pathFor(page: Page, role: DemoRole): string {
  const shared: Partial<Record<Page, string>> = { marketplace: '/', cart: '/cart', checkout: '/checkout', sell: '/sell' }
  if (shared[page]) return shared[page]!
  if (role === 'Admin') {
    const map: Partial<Record<Page, string>> = { dashboard: '/admin', users: '/admin/users', vendors: '/admin/applications', reports: '/admin/reports', products: '/admin/products', orders: '/admin/orders' }
    return map[page] ?? '/admin'
  }
  const sellerMap: Partial<Record<Page, string>> = {
    dashboard: '/seller', store: '/seller/store', products: '/seller/products', payouts: '/seller/payouts', reviews: '/seller/reviews',
    orders: '/seller/orders', messages: '/seller/messages', notifications: '/seller/notifications', profile: '/seller/settings',
  }
  // Seller-only pages always live under /seller; shared pages follow the current view.
  if (['dashboard', 'store', 'products', 'payouts', 'reviews'].includes(page) || role === 'Seller') return sellerMap[page] ?? '/seller'
  const buyerMap: Partial<Record<Page, string>> = { orders: '/orders', messages: '/messages', notifications: '/notifications', profile: '/profile', users: '/admin/users', vendors: '/admin/applications', reports: '/admin/reports' }
  return buyerMap[page] ?? '/'
}

/** Only same-app paths are accepted as post-sign-in destinations. */
export function safeRedirect(value: unknown, fallback = '/'): string {
  const v = Array.isArray(value) ? value[0] : value
  if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//')) return fallback
  if (/^\/(login|register|admin\/login)(\?|$)/.test(v)) return fallback
  return v
}

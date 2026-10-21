import type { DemoRole, Page } from '../types'

export interface NavItem {
  label: string
  page: Page
  icon: string
}

export const HEADER_NAV: Record<DemoRole, NavItem[]> = {
  Buyer: [
    { label: 'Marketplace', page: 'marketplace', icon: 'home' },
    { label: 'My Orders', page: 'orders', icon: 'package' },
    { label: 'Messages', page: 'messages', icon: 'message' },
  ],
  Seller: [
    { label: 'Dashboard', page: 'dashboard', icon: 'dashboard' },
    { label: 'Orders', page: 'orders', icon: 'package' },
    { label: 'Messages', page: 'messages', icon: 'message' },
  ],
  Admin: [
    { label: 'Dashboard', page: 'dashboard', icon: 'dashboard' },
    { label: 'Applications', page: 'vendors', icon: 'store' },
    { label: 'Reports', page: 'reports', icon: 'flag' },
  ],
}

export const SIDEBAR_NAV: Record<'Seller' | 'Admin', NavItem[]> = {
  Seller: [
    { label: 'Dashboard', page: 'dashboard', icon: 'dashboard' },
    { label: 'My Store', page: 'store', icon: 'store' },
    { label: 'Products', page: 'products', icon: 'box' },
    { label: 'Orders', page: 'orders', icon: 'package' },
    { label: 'Messages', page: 'messages', icon: 'message' },
    { label: 'Payouts', page: 'payouts', icon: 'wallet' },
    { label: 'Reviews', page: 'reviews', icon: 'star' },
    { label: 'Settings', page: 'profile', icon: 'settings' },
  ],
  Admin: [
    { label: 'Dashboard', page: 'dashboard', icon: 'dashboard' },
    { label: 'Users', page: 'users', icon: 'users' },
    { label: 'Seller Applications', page: 'vendors', icon: 'store' },
    { label: 'Product Reports', page: 'reports', icon: 'flag' },
    { label: 'Products', page: 'products', icon: 'box' },
    { label: 'Orders', page: 'orders', icon: 'package' },
  ],
}

/** Mobile bottom bar, per view. "explore" scrolls to the marketplace browse section. */
export const BOTTOM_NAV: Record<DemoRole, { label: string; icon: string; page: Page | 'explore' }[]> = {
  Buyer: [
    { label: 'Home', icon: 'home', page: 'marketplace' },
    { label: 'Explore', icon: 'compass', page: 'explore' },
    { label: 'Orders', icon: 'package', page: 'orders' },
    { label: 'Messages', icon: 'message', page: 'messages' },
    { label: 'Profile', icon: 'user', page: 'profile' },
  ],
  Seller: [
    { label: 'Dashboard', icon: 'dashboard', page: 'dashboard' },
    { label: 'Products', icon: 'box', page: 'products' },
    { label: 'Orders', icon: 'package', page: 'orders' },
    { label: 'Messages', icon: 'message', page: 'messages' },
    { label: 'Store', icon: 'store', page: 'store' },
  ],
  Admin: [
    { label: 'Dashboard', icon: 'dashboard', page: 'dashboard' },
    { label: 'Users', icon: 'users', page: 'users' },
    { label: 'Sellers', icon: 'store', page: 'vendors' },
    { label: 'Reports', icon: 'flag', page: 'reports' },
    { label: 'Orders', icon: 'package', page: 'orders' },
  ],
}

/** Pages that render inside the Seller/Admin workspace (sidebar layout). */
export const WORKSPACE_PAGES: Page[] = [
  'dashboard', 'store', 'products', 'orders', 'messages', 'payouts', 'reviews', 'profile',
  'users', 'vendors', 'reports', 'notifications',
]

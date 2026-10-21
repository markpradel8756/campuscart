import type {
  Account,
  ChatMessage,
  DemoNotification,
  Order,
  Product,
  ProductReport,
  UserData,
  VendorApplication,
} from '../types'

export const money = (value: number) => `₱${value.toLocaleString('en-PH')}`

export const productImage = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=650&q=85`

export const HERO_IMAGE =
  'https://www.carsu.edu.ph/wp-content/uploads/2025/02/CSU-Main-Building-1024x683.jpg'

export const HERO_AVATARS = [
  'https://i.pravatar.cc/60?img=47',
  'https://i.pravatar.cc/60?img=12',
  'https://i.pravatar.cc/60?img=49',
]

export const SAMPLE_PRODUCT_IMAGE = productImage('photo-1590874103328-eac38a683ce7')

export const CATEGORIES = [
  { name: 'All items', icon: 'grid' },
  { name: 'Books & Notes', icon: 'book' },
  { name: 'Electronics', icon: 'headphones' },
  { name: 'Fashion & Accessories', icon: 'shirt' },
  { name: 'School Supplies', icon: 'pencil' },
  { name: 'Dorm Essentials', icon: 'lamp' },
  { name: 'Others', icon: 'more' },
] as const

export const CONDITIONS = ['Brand new', 'Like new', 'Good'] as const

export const PICKUP_LOCATIONS = [
  'Student Center · Main entrance',
  'University Library',
  'College of Engineering lobby',
] as const

export const PAYMENT_METHODS = ['Cash on pickup', 'GCash (simulated)'] as const

export const REPORT_REASONS = [
  'Misleading description',
  'Suspicious or counterfeit item',
  'Prohibited product',
  'Inappropriate content',
] as const

export const createProducts = (): Product[] => [
  { id: 1, name: 'Calculus: Early Transcendentals', price: 450, category: 'Books & Notes', condition: 'Like new', store: 'Bea’s Book Nook', image: productImage('photo-1544947950-fa07a98d237f'), stock: 2, rating: '4.9' },
  { id: 2, name: 'Wireless Bluetooth Headphones', price: 850, category: 'Electronics', condition: 'Like new', store: 'Tech by Miguel', image: productImage('photo-1546435770-a3e426bf472b'), stock: 3, rating: '4.8' },
  { id: 3, name: 'Everyday Canvas Tote Bag', price: 180, category: 'Fashion & Accessories', condition: 'Brand new', store: 'Little Campus Finds', image: productImage('photo-1590874103328-eac38a683ce7'), stock: 12, rating: '5.0' },
  { id: 4, name: 'Pastel Highlighter Set · 6 colors', price: 120, category: 'School Supplies', condition: 'Brand new', store: 'The Study Corner', image: productImage('photo-1455390582262-044cdead277a'), stock: 8, rating: '4.9' },
  { id: 5, name: 'Fujifilm Instax Mini 11', price: 2800, category: 'Electronics', condition: 'Good', store: 'Tech by Miguel', image: productImage('photo-1516035069371-29a1b244cc32'), stock: 1, rating: '4.8' },
  { id: 6, name: 'Minimalist Desk Lamp', price: 350, category: 'Dorm Essentials', condition: 'Like new', store: 'Dorm Finds by Alex', image: productImage('photo-1507473885765-e6ed057f782c'), stock: 2, rating: '4.7' },
  { id: 7, name: 'Classic Campus Sneakers', price: 650, category: 'Fashion & Accessories', condition: 'Good', store: 'Little Campus Finds', image: productImage('photo-1549298916-b41d501d3772'), stock: 1, rating: '4.9' },
  { id: 8, name: 'Atomic Habits · James Clear', price: 280, category: 'Books & Notes', condition: 'Like new', store: 'Bea’s Book Nook', image: productImage('photo-1543002588-bfa74002ed7e'), stock: 3, rating: '4.9' },
]

export const ADMIN_DEMO = {
  email: 'admin@campuscart.demo',
  password: 'admin-demo',
}

export const DEMO_BUYER_PASSWORD = 'campus123'

export const SEED_STORE = 'Little Campus Finds'

export const createAccounts = (): Account[] => [
  { id: 'acc-jamie', name: 'Jamie Dela Cruz', email: 'jamie.delacruz@university.edu.ph', password: DEMO_BUYER_PASSWORD, studentNumber: '2024-01284', department: 'College of Engineering', campus: 'Main Campus', notificationsOn: true, sellerStatus: 'approved', storeName: SEED_STORE, storeType: 'Student-owned store', storePayments: 'Cash on pickup, GCash' },
  { id: 'acc-bea', name: 'Bea Mendoza', email: 'bea.mendoza@university.edu.ph', password: DEMO_BUYER_PASSWORD, studentNumber: '2023-00417', department: 'College of Engineering', campus: 'Main Campus', notificationsOn: true, sellerStatus: 'approved', storeName: 'Bea’s Book Nook', storeType: 'Student-owned store', storePayments: 'Cash on pickup' },
  { id: 'acc-miguel', name: 'Miguel Santos', email: 'miguel.santos@university.edu.ph', password: DEMO_BUYER_PASSWORD, studentNumber: '2024-00862', department: 'College of Engineering', campus: 'Main Campus', notificationsOn: true, sellerStatus: 'none', storeName: '', storeType: 'Student-owned store', storePayments: 'Cash on pickup' },
  { id: 'acc-andrea', name: 'Andrea Reyes', email: 'andrea.reyes@university.edu.ph', password: DEMO_BUYER_PASSWORD, studentNumber: '2025-00139', department: 'College of Engineering', campus: 'Main Campus', notificationsOn: true, sellerStatus: 'none', storeName: '', storeType: 'Student-owned store', storePayments: 'Cash on pickup' },
]

export const createOrders = (products: Product[]): Order[] => [
  {
    id: 'CM-1024',
    items: [{ product: { ...products.find((p) => p.id === 8)! }, qty: 1 }],
    status: 'Completed',
    payment: 'Cash on pickup',
    location: 'University Library',
    time: '2026-10-18T13:00',
    buyerId: 'acc-jamie',
    buyerName: 'Jamie Dela Cruz',
  },
]

export const createReports = (): ProductReport[] => [
  { id: 1, name: 'Scientific Calculator', reason: 'Misleading description', status: 'Pending', reporter: 'Jamie Dela Cruz' },
]

export const createVendors = (): VendorApplication[] => [
  { id: 1, accountId: null, applicant: 'Rosa Villanueva', email: 'hello@dailybrew.example', name: 'The Daily Brew', type: 'Campus food vendor', status: 'Pending', permit: 'BUS-2026-0041', campus: 'Main Campus', location: 'Student Center · Stall 4', category: 'Others', description: 'Coffee, pastries, and study-break snacks.' },
  { id: 2, accountId: null, applicant: 'Paolo Garcia', email: 'printandgo@university.edu.ph', name: 'Print & Go', type: 'Student-owned store', status: 'Pending', permit: 'BUS-2026-0042', campus: 'Main Campus', location: 'Student Center · Stall 5', category: 'School Supplies', description: 'Printing, binding, and last-minute school supplies.' },
]

const createSeedNotifications = (): DemoNotification[] => [
  { id: 1, text: 'Welcome to CampusCart! Your community is ready for you.', target: 'marketplace', read: false },
  { id: 2, text: 'Your pickup reminder: Atomic Habits at the University Library.', target: 'orders', read: false },
  { id: 3, text: 'Bea’s Book Nook sent you a message.', target: 'messages', read: false },
]

const createSeedMessages = (): ChatMessage[] => [
  { id: 1, text: 'Hi! Yes, this is still available. We can meet at the Student Center.', fromMe: false, time: 'Today, 10:24 AM' },
]

/** Fresh per-account data. Every account starts with the demo conversation. */
export const createUserData = (seeded = false): UserData => ({
  cart: [],
  saved: [],
  messages: createSeedMessages(),
  notifications: seeded
    ? createSeedNotifications()
    : [{ id: 1, text: 'Welcome to CampusCart! Your community is ready for you.', target: 'marketplace', read: false }],
})

export const createAllUserData = (accounts: Account[]): Record<string, UserData> =>
  Object.fromEntries(accounts.map((a) => [a.id, createUserData(a.id === 'acc-jamie')]))

export const initialsOf = (name: string) =>
  name
    .replace(/[’']s\b/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || 'CM'

export const DEPARTMENTS = ['College of Engineering', 'College of Business', 'College of Arts & Sciences'] as const
export const CAMPUSES = ['Main Campus', 'City Campus'] as const
export const STORE_TYPES = ['Student-owned store', 'Campus vendor'] as const

export const PAYOUT_HISTORY = [
  { date: 'October 18, 2026', amount: 1500 },
  { date: 'October 11, 2026', amount: 1250 },
  { date: 'October 4, 2026', amount: 1000 },
]

export const SELLER_REVIEWS = [
  { text: 'Exactly as described. Such an easy campus pickup!', author: 'Andrea M.' },
  { text: 'Great seller and a really good find. Thank you!', author: 'Alex R.' },
  { text: 'Friendly and quick to respond. Would buy again.', author: 'Carlo S.' },
]

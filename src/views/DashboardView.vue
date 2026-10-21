<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { SEED_STORE, money } from '../data/demoData'

const store = useMarketplace()
const { role, products, orders, reports, vendors, pendingOrders, completedOrders, lowStockProducts, pendingApplications, openReports, myProducts, storeOrders, currentAccount, storeName, accounts } = store
const approvedCount = computed(() => vendors.value.filter((v) => v.status === 'Approved').length + accounts.value.filter((a) => a.sellerStatus === 'approved' && !vendors.value.some((v) => v.accountId === a.id)).length)

const recentOrders = computed(() => storeOrders.value.slice(0, 4))
// Sellers see only their store's line items in an order.
const storeTotal = (id: string) => {
  const o = orders.value.find((x) => x.id === id)
  return o ? o.items.filter((i) => i.product.store === storeName.value).reduce((s, i) => s + i.qty * i.product.price, 0) : 0
}
const firstName = computed(() => currentAccount.value?.name.split(' ')[0] ?? 'there')
const isSeedStore = computed(() => storeName.value === SEED_STORE)
const pendingVendors = computed(() => vendors.value.filter((v) => v.status === 'Pending'))
const openReportList = computed(() => reports.value.filter((r) => r.status !== 'Resolved').slice(0, 4))
</script>

<template>
  <div v-if="role === 'Seller'">
    <header class="page-head">
      <span class="eyebrow">Your little business, growing</span>
      <h1>Welcome back, {{ firstName }}.</h1>
      <p>Here’s how your campus store is doing today.</p>
    </header>

    <div class="stat-grid">
      <StatCard label="Total products" :value="myProducts.length" icon="box" :hint="storeName" />
      <StatCard label="Pending orders" :value="pendingOrders" icon="clock" tone="yellow" />
      <StatCard label="Completed orders" :value="completedOrders" icon="check-circle" />
      <StatCard v-if="isSeedStore" label="Store rating" value="4.9" suffix="/ 5" icon="star" tone="yellow" />
      <StatCard v-else label="Store rating" value="New" icon="star" tone="yellow" hint="Ratings appear after reviews" />
    </div>

    <div class="dash-grid">
      <section class="panel" aria-labelledby="recent-title">
        <div class="panel-head">
          <h2 id="recent-title" class="panel-title">Recent orders</h2>
          <button type="button" class="link-btn" @click="store.navigate('orders')">View all <AppIcon name="arrow-right" :size="13" /></button>
        </div>
        <div v-for="o in recentOrders" :key="o.id" class="mini-row">
          <img :src="o.items[0].product.image" :alt="o.items[0].product.name" />
          <div class="grow">
            <strong>{{ o.items[0].product.name }}<template v-if="o.items.length > 1"> +{{ o.items.length - 1 }} more</template></strong>
            <small>{{ o.id }} · {{ money(storeTotal(o.id)) }}</small>
          </div>
          <StatusBadge :status="o.status" />
        </div>
        <p v-if="!recentOrders.length" class="mini-empty">No orders for your store yet.</p>
      </section>

      <section class="panel" aria-labelledby="low-title">
        <div class="panel-head">
          <h2 id="low-title" class="panel-title">Running a little low</h2>
          <span class="badge badge-yellow">{{ lowStockProducts.length }}</span>
        </div>
        <div v-for="p in lowStockProducts" :key="p.id" class="mini-row">
          <img :src="p.image" :alt="p.name" />
          <div class="grow">
            <strong>{{ p.name }}</strong>
            <small>{{ p.stock === 0 ? 'Out of stock' : `${p.stock} left` }}</small>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="store.openModal('product-editor', { product: p })">Update stock</button>
        </div>
        <p v-if="!myProducts.length" class="mini-empty">
          You haven’t listed anything yet.
          <button type="button" class="link-btn" @click="store.openModal('product-editor')">Add your first product</button>
        </p>
        <p v-else-if="!lowStockProducts.length" class="mini-empty">Everything is well stocked.</p>
      </section>
    </div>
  </div>

  <div v-else>
    <header class="page-head">
      <span class="eyebrow">A thriving campus community</span>
      <h1>Marketplace overview</h1>
      <p>Here’s what’s happening across CampusCart.</p>
    </header>

    <div class="stat-grid six">
      <StatCard label="Total users" :value="(2478 + accounts.length).toLocaleString('en-PH')" icon="users" hint="Mock total incl. demo sign-ups" />
      <StatCard label="Approved vendors" :value="46 + approvedCount" icon="store" hint="Mock total incl. demo approvals" />
      <StatCard label="Pending applications" :value="pendingApplications" icon="clock" tone="yellow" />
      <StatCard label="Active products" :value="products.length" icon="box" />
      <StatCard label="Open reports" :value="openReports" icon="flag" tone="yellow" />
      <StatCard label="Total orders" :value="orders.length" icon="package" />
    </div>

    <div class="dash-grid">
      <section class="panel" aria-labelledby="attention-title">
        <div class="panel-head">
          <h2 id="attention-title" class="panel-title">Needs your attention</h2>
        </div>
        <div class="attention-item">
          <span class="attention-icon"><AppIcon name="store" :size="17" /></span>
          <div class="grow">
            <strong>{{ pendingApplications }} vendor application{{ pendingApplications === 1 ? '' : 's' }} waiting</strong>
            <small>{{ pendingVendors.map((v) => v.name).join(' · ') || 'All caught up' }}</small>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="store.navigate('vendors')">Review vendor applications</button>
        </div>
        <div class="attention-item">
          <span class="attention-icon"><AppIcon name="flag" :size="17" /></span>
          <div class="grow">
            <strong>{{ openReports }} open product report{{ openReports === 1 ? '' : 's' }}</strong>
            <small>Help keep our campus marketplace safe and trustworthy.</small>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="store.navigate('reports')">Open reports</button>
        </div>
      </section>

      <section class="panel" aria-labelledby="reports-title">
        <div class="panel-head">
          <h2 id="reports-title" class="panel-title">Report summaries</h2>
          <button type="button" class="link-btn" @click="store.navigate('reports')">View all <AppIcon name="arrow-right" :size="13" /></button>
        </div>
        <div v-for="r in openReportList" :key="r.id" class="mini-row">
          <span class="attention-icon"><AppIcon name="flag" :size="16" /></span>
          <div class="grow">
            <strong>{{ r.name }}</strong>
            <small>{{ r.reason }}</small>
          </div>
          <StatusBadge :status="r.status" />
        </div>
        <p v-if="!openReportList.length" class="mini-empty">No open reports. Nice work.</p>
      </section>
    </div>
  </div>
</template>

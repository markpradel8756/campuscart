<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Order, OrderStatus } from '../types'
import AppIcon from '../components/AppIcon.vue'
import OrderCard from '../components/OrderCard.vue'
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { visibleOrders: orders, role } = store

const tabs: ('All' | OrderStatus)[] = ['All', 'Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled']
const activeTab = ref<'All' | OrderStatus>('All')

const visible = computed(() =>
  activeTab.value === 'All' ? orders.value : orders.value.filter((o) => o.status === activeTab.value),
)
const countFor = (tab: 'All' | OrderStatus) =>
  tab === 'All' ? orders.value.length : orders.value.filter((o) => o.status === tab).length

const cancel = (o: Order) => store.setOrderStatus(o, 'Cancelled', `Order ${o.id} was cancelled.`)
const confirmPickup = (o: Order) => store.setOrderStatus(o, 'Completed', 'Pickup confirmed. Enjoy your campus find!')
const confirm = (o: Order) => store.setOrderStatus(o, 'Confirmed', `Order ${o.id} confirmed. The buyer will be notified (demo).`)
const ready = (o: Order) => store.setOrderStatus(o, 'Ready for Pickup', `Order ${o.id} is ready for pickup.`)
const review = (o: Order) => store.openModal('review', { order: o })
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">{{ role === 'Buyer' ? 'From first click to campus pickup' : role === 'Admin' ? 'All campus orders' : 'Your store orders' }}</span>
      <h1>{{ role === 'Buyer' ? 'My orders' : 'Order management' }}</h1>
      <p>Keep track of your orders, from first click to campus pickup.</p>
    </header>

    <div class="tabs" role="tablist" aria-label="Filter orders by status">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        role="tab"
        class="tab"
        :class="{ active: activeTab === tab }"
        :aria-selected="activeTab === tab"
        @click="activeTab = tab"
      >
        {{ tab }} <span class="tab-count">{{ countFor(tab) }}</span>
      </button>
    </div>

    <div v-if="visible.length" class="order-list">
      <OrderCard
        v-for="order in visible"
        :key="order.id"
        :order="order"
        :role="role"
        @cancel="cancel"
        @confirm-pickup="confirmPickup"
        @review="review"
        @confirm="confirm"
        @ready="ready"
      />
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon"><AppIcon name="package" :size="22" /></div>
      <h3>No {{ activeTab === 'All' ? '' : activeTab.toLowerCase() + ' ' }}orders yet</h3>
      <p>{{ role === 'Seller' ? 'Orders for your store will show up here.' : 'Your campus orders will show up here.' }}</p>
      <button v-if="role === 'Buyer'" type="button" class="btn btn-primary" @click="store.navigate('marketplace')">Explore marketplace</button>
    </div>
  </div>
</template>

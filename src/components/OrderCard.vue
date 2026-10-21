<script setup lang="ts">
import { computed } from 'vue'
import type { DemoRole, Order } from '../types'
import { money } from '../data/demoData'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ order: Order; role: DemoRole }>()
const emit = defineEmits<{
  cancel: [order: Order]
  confirmPickup: [order: Order]
  review: [order: Order]
  confirm: [order: Order]
  ready: [order: Order]
}>()

const store = computed(() => props.order.items[0]?.product.store ?? 'Campus store')
const total = computed(() => props.order.items.reduce((sum, i) => sum + i.qty * i.product.price, 0))
const paymentStatus = computed(() => (props.order.status === 'Completed' ? 'Paid (demo)' : 'Payment pending'))

const pickupTime = computed(() => {
  const d = new Date(props.order.time)
  if (Number.isNaN(d.getTime())) return props.order.time
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
})

const confirmation = computed(() => {
  switch (props.order.status) {
    case 'Pending':
      return { seller: 'Waiting for seller confirmation', buyer: 'Order placed by buyer' }
    case 'Confirmed':
      return { seller: 'Confirmed by seller', buyer: 'Waiting for pickup to be ready' }
    case 'Ready for Pickup':
      return { seller: 'Ready at the pickup point', buyer: 'Waiting for buyer pickup confirmation' }
    case 'Completed':
      return { seller: 'Handed over by seller', buyer: 'Pickup confirmed by buyer' }
    default:
      return { seller: 'Order cancelled', buyer: 'No pickup needed' }
  }
})

const isBuyer = computed(() => props.role === 'Buyer')
</script>

<template>
  <article class="order-card">
    <header class="order-head">
      <div>
        <span class="order-id">{{ order.id }}</span>
        <span class="order-store"><AppIcon name="bag" :size="13" />{{ store }}</span>
        <span v-if="!isBuyer" class="order-store"><AppIcon name="user" :size="13" />Buyer: {{ order.buyerName }}</span>
      </div>
      <StatusBadge :status="order.status" />
    </header>

    <div class="order-items">
      <div v-for="item in order.items" :key="item.product.id" class="order-item">
        <img :src="item.product.image" :alt="item.product.name" />
        <div>
          <strong>{{ item.product.name }}</strong>
          <small>Qty {{ item.qty }} · {{ money(item.product.price) }} each</small>
        </div>
        <span class="line-total">{{ money(item.qty * item.product.price) }}</span>
      </div>
    </div>

    <div class="order-details">
      <div class="order-detail">
        <small>Pickup location</small>
        <span><AppIcon name="map-pin" :size="13" />{{ order.location }}</span>
      </div>
      <div class="order-detail">
        <small>Pickup time</small>
        <span><AppIcon name="calendar" :size="13" />{{ pickupTime }}</span>
      </div>
      <div class="order-detail">
        <small>Payment</small>
        <span><AppIcon name="card" :size="13" />{{ order.payment }}</span>
      </div>
      <div class="order-detail">
        <small>Payment status</small>
        <span><AppIcon :name="order.status === 'Completed' ? 'check-circle' : 'clock'" :size="13" />{{ paymentStatus }}</span>
      </div>
    </div>

    <footer class="order-foot">
      <div class="order-confirm">
        <span><b>Seller:</b> {{ confirmation.seller }}</span>
        <span><b>Buyer:</b> {{ confirmation.buyer }}</span>
      </div>
      <div class="order-actions">
        <span v-if="role === 'Admin'" class="order-total">Read-only in admin view ·</span>
        <span class="order-total">Total <strong>{{ money(total) }}</strong></span>
        <template v-if="isBuyer">
          <button v-if="order.status === 'Pending'" type="button" class="btn btn-danger btn-sm" @click="emit('cancel', order)">
            Cancel order
          </button>
          <button v-if="order.status === 'Ready for Pickup'" type="button" class="btn btn-primary btn-sm" @click="emit('confirmPickup', order)">
            <AppIcon name="check" :size="14" /> Confirm pickup
          </button>
          <button
            v-if="order.status === 'Completed'"
            type="button"
            class="btn btn-secondary btn-sm"
            :disabled="order.reviewed"
            @click="emit('review', order)"
          >
            <AppIcon name="star" :size="14" /> {{ order.reviewed ? 'Review submitted' : 'Write a review' }}
          </button>
        </template>
        <template v-else-if="role === 'Seller'">
          <button v-if="order.status === 'Pending'" type="button" class="btn btn-primary btn-sm" @click="emit('confirm', order)">
            <AppIcon name="check" :size="14" /> Confirm order
          </button>
          <button v-if="order.status === 'Confirmed'" type="button" class="btn btn-primary btn-sm" @click="emit('ready', order)">
            <AppIcon name="package" :size="14" /> Mark ready for pickup
          </button>
        </template>
      </div>
    </footer>
  </article>
</template>

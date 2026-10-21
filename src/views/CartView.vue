<script setup lang="ts">
import AppIcon from '../components/AppIcon.vue'
import QuantityStepper from '../components/QuantityStepper.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { money } from '../data/demoData'

const store = useMarketplace()
const { cart, cartSubtotal } = store
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-head">
        <span class="eyebrow">Your next great find</span>
        <h1>Your shopping cart</h1>
        <p>Local finds. Easy campus pickups.</p>
      </header>

      <div v-if="cart.length" class="two-col">
        <section class="panel panel-pad" aria-label="Cart items">
          <div v-for="item in cart" :key="item.product.id" class="cart-row">
            <img :src="item.product.image" :alt="item.product.name" />
            <div class="cart-info">
              <h3>{{ item.product.name }}</h3>
              <span class="store-line"><AppIcon name="bag" :size="12" />{{ item.product.store }}</span>
              <p class="unit">{{ money(item.product.price) }}</p>
            </div>
            <QuantityStepper
              :model-value="item.qty"
              :max="item.product.stock"
              small
              :label="`Quantity for ${item.product.name}`"
              @update:model-value="store.updateCartQty(item.product.id, $event)"
            />
            <button type="button" class="remove-btn" :aria-label="`Remove ${item.product.name}`" @click="store.removeFromCart(item.product.id)">
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </section>

        <aside class="panel panel-pad sticky-col" aria-label="Order summary">
          <h2 class="panel-title">Order summary</h2>
          <hr class="divider" />
          <div class="summary-row"><span>Subtotal</span><strong>{{ money(cartSubtotal) }}</strong></div>
          <div class="summary-row"><span>Platform fee</span><strong>{{ money(0) }}</strong></div>
          <div class="summary-row"><span>Campus pickup</span><strong>Free</strong></div>
          <div class="summary-total"><span>Total</span><span>{{ money(cartSubtotal) }}</span></div>
          <div class="summary-actions">
            <button type="button" class="btn btn-primary" @click="store.navigate('checkout')">
              Proceed to checkout <AppIcon name="arrow-right" :size="15" />
            </button>
            <button type="button" class="btn btn-secondary" @click="store.navigate('marketplace')">Continue shopping</button>
          </div>
          <p class="safety"><AppIcon name="shield" :size="14" />Stay on campus. Meet in a public place.</p>
        </aside>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon"><AppIcon name="cart" :size="22" /></div>
        <h3>Your cart is waiting for a good find.</h3>
        <p>Local finds. Easy campus pickups.</p>
        <button type="button" class="btn btn-primary" @click="store.navigate('marketplace')">Explore marketplace</button>
      </div>
    </div>
  </div>
</template>

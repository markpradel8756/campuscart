<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { PAYMENT_METHODS, PICKUP_LOCATIONS, money } from '../data/demoData'

const store = useMarketplace()
const { cart, cartSubtotal } = store

const payment = ref<string>(PAYMENT_METHODS[0])
const location = ref<string>(PICKUP_LOCATIONS[0])
const time = ref('2026-10-20T12:00')
const error = ref('')

function submit() {
  if (!time.value) {
    error.value = 'Please choose a preferred pickup time.'
    return
  }
  error.value = ''
  store.placeOrder(payment.value, location.value, time.value)
}
</script>

<template>
  <div class="page">
    <div class="container">
      <button type="button" class="back-link" @click="store.goBack('/cart')">
        <AppIcon name="chevron-left" :size="15" /> Back to cart
      </button>
      <header class="page-head">
        <span class="eyebrow">Checkout</span>
        <h1>A few details, then it’s yours.</h1>
      </header>

      <div v-if="!cart.length" class="empty-state">
        <div class="empty-icon"><AppIcon name="cart" :size="22" /></div>
        <h3>Your cart is waiting for a good find.</h3>
        <p>Add something to your cart to check out.</p>
        <button type="button" class="btn btn-primary" @click="store.navigate('marketplace')">Explore marketplace</button>
      </div>

      <form v-else class="two-col" novalidate @submit.prevent="submit">
        <div class="form-stack">
          <section class="panel panel-pad" aria-labelledby="review-title">
            <h2 id="review-title" class="panel-title">Review your items</h2>
            <hr class="divider" />
            <div class="checkout-items">
              <div v-for="item in cart" :key="item.product.id" class="checkout-item">
                <img :src="item.product.image" :alt="item.product.name" />
                <div class="grow">
                  <strong>{{ item.product.name }}</strong>
                  <small>{{ item.product.store }} · Qty {{ item.qty }} · {{ money(item.product.price) }} each</small>
                </div>
                <span class="line-total">{{ money(item.qty * item.product.price) }}</span>
              </div>
            </div>
          </section>

          <section class="panel panel-pad form-stack" aria-labelledby="pay-title">
            <h2 id="pay-title" class="panel-title">Payment &amp; pickup</h2>
            <fieldset class="fieldset">
              <legend>Payment method</legend>
              <div class="option-grid">
                <label v-for="m in PAYMENT_METHODS" :key="m" class="option-card">
                  <input v-model="payment" type="radio" name="payment" :value="m" />
                  {{ m }}
                  <AppIcon :name="m.startsWith('GCash') ? 'card' : 'wallet'" :size="16" />
                </label>
              </div>
            </fieldset>
            <div class="form-grid">
              <label class="field">
                <span>Pickup location</span>
                <select v-model="location" class="select">
                  <option v-for="l in PICKUP_LOCATIONS" :key="l" :value="l">{{ l }}</option>
                </select>
              </label>
              <label class="field">
                <span>Preferred pickup time</span>
                <input v-model="time" class="input" type="datetime-local" required :aria-invalid="!!error" aria-describedby="time-error" />
                <span v-if="error" id="time-error" class="field-error">{{ error }}</span>
              </label>
            </div>
            <p class="notice"><AppIcon name="info" :size="15" />Demo only: no money is collected. Your seller will confirm the pickup schedule.</p>
          </section>
        </div>

        <aside class="panel panel-pad sticky-col" aria-label="Order summary">
          <h2 class="panel-title">Order summary</h2>
          <hr class="divider" />
          <div class="summary-row"><span>Subtotal</span><strong>{{ money(cartSubtotal) }}</strong></div>
          <div class="summary-row"><span>Platform fee</span><strong>{{ money(0) }}</strong></div>
          <div class="summary-row"><span>Campus pickup</span><strong>Free</strong></div>
          <div class="summary-row"><span>Payment</span><strong>{{ payment }}</strong></div>
          <div class="summary-total"><span>Total</span><span>{{ money(cartSubtotal) }}</span></div>
          <div class="summary-actions">
            <button type="submit" class="btn btn-primary">Place sample order</button>
          </div>
          <p class="safety"><AppIcon name="shield" :size="14" />Stay on campus. Meet in a public place.</p>
        </aside>
      </form>
    </div>
  </div>
</template>

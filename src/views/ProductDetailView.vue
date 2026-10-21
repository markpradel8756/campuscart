<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import QuantityStepper from '../components/QuantityStepper.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { money } from '../data/demoData'

const props = defineProps<{ id: number }>()
const store = useMarketplace()

// Looked up from the URL, so /product/3 works on refresh and in shared links.
const found = computed(() => store.products.value.find((p) => p.id === props.id) ?? null)

const qty = ref(1)
watch(() => props.id, () => (qty.value = 1))

const product = computed(() => found.value!)

const inCart = computed(() => store.cart.value.find((i) => i.product.id === product.value.id)?.qty ?? 0)
const soldOut = computed(() => product.value.stock < 1)
const saved = computed(() => store.savedIds.value.includes(product.value.id))
const initials = computed(() =>
  product.value.store === 'Bea’s Book Nook' ? 'BM' : product.value.store
    .replace(/[’']s\b/g, '')
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join(''),
)

function addToCart() {
  store.addToCart(product.value, qty.value)
}

function buyNow() {
  store.buyNow(product.value, qty.value)
}

function report() {
  if (store.requireAuth({ type: 'report', productId: product.value.id })) store.openModal('report', { product: product.value })
}
</script>

<template>
  <div class="page">
    <div class="container">
      <button type="button" class="back-link" @click="store.goBack('/')">
        <AppIcon name="chevron-left" :size="15" /> Back to marketplace
      </button>

      <div v-if="!found" class="empty-state">
        <div class="empty-icon"><AppIcon name="search" :size="22" /></div>
        <h3>This find isn’t on CampusCart anymore</h3>
        <p>It may have sold or been removed. There are plenty more on campus.</p>
        <RouterLink to="/" class="btn btn-primary">Show all products</RouterLink>
      </div>

      <div v-else class="detail-grid">
        <div class="detail-media">
          <img :src="product.image" :alt="product.name" />
          <button
            type="button"
            class="save-btn"
            :class="{ saved }"
            :aria-pressed="saved"
            :aria-label="saved ? 'Remove from saved finds' : 'Save this find'"
            @click="store.toggleSaved(product.id)"
          >
            <AppIcon name="heart" :size="17" />
          </button>
        </div>

        <div class="detail-info">
          <span class="eyebrow">{{ product.category }}</span>
          <h1>{{ product.name }}</h1>
          <span class="badge">{{ product.condition }}</span>
          <p class="detail-price">{{ money(product.price) }}</p>
          <p class="detail-desc">
            A great campus find, ready for its next chapter. Well cared for and exactly as pictured. Meet safely on campus for pickup.
          </p>

          <div class="seller-panel">
            <span class="avatar">{{ initials || 'CM' }}</span>
            <div>
              <strong>{{ product.store }}</strong>
              <small><AppIcon name="shield" :size="12" />Verified campus seller</small>
            </div>
            <span class="rating"><AppIcon name="star" :size="13" />{{ product.rating }}</span>
          </div>

          <div class="detail-qty">
            <QuantityStepper v-model="qty" :max="Math.max(1, product.stock)" label="Quantity to add" />
            <span>
              {{ soldOut ? 'Currently unavailable' : `${product.stock} available` }}
              <template v-if="inCart"> · {{ inCart }} in your cart</template>
            </span>
          </div>

          <div class="detail-actions">
            <button type="button" class="btn btn-secondary" :disabled="soldOut" @click="addToCart">
              <AppIcon name="cart" :size="16" /> Add to cart
            </button>
            <button type="button" class="btn btn-primary" :disabled="soldOut" @click="buyNow">Buy now</button>
          </div>

          <div class="detail-links">
            <button type="button" class="link-btn" @click="store.navigate('messages')">
              <AppIcon name="message" :size="15" /> Message seller
            </button>
            <button type="button" class="report-link" @click="report">
              <AppIcon name="flag" :size="14" /> Report this listing
            </button>
          </div>

          <div class="feedback">
            <h3>What students are saying</h3>
            <blockquote>
              <span class="stars" aria-label="5 out of 5 stars">
                <AppIcon v-for="n in 5" :key="n" name="star" :size="12" />
              </span>
              <p>“Easy pickup and just as described. Thank you!”</p>
              <cite>— Andrea M.</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

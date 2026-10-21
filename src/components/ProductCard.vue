<script setup lang="ts">
import type { Product } from '../types'
import { money } from '../data/demoData'
import AppIcon from './AppIcon.vue'

defineProps<{ product: Product; saved: boolean }>()
const emit = defineEmits<{ open: [product: Product]; toggleSave: [id: number] }>()
</script>

<template>
  <article class="product-card">
    <button
      type="button"
      class="save-btn"
      :class="{ saved }"
      :aria-pressed="saved"
      :aria-label="saved ? `Remove ${product.name} from saved finds` : `Save ${product.name}`"
      @click="emit('toggleSave', product.id)"
    >
      <AppIcon name="heart" :size="15" />
    </button>
    <button type="button" class="product-card-open" :aria-label="`View ${product.name}, ${money(product.price)}`" @click="emit('open', product)">
      <div class="product-media">
        <img :src="product.image" :alt="product.name" loading="lazy" />
        <span class="badge">{{ product.condition }}</span>
      </div>
      <div class="product-body">
        <span class="product-cat">{{ product.category }}</span>
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-meta">
          <span class="product-price">{{ money(product.price) }}</span>
          <span class="stock" :class="{ low: product.stock === 1 }">{{ product.stock === 1 ? '1 left' : 'In stock' }}</span>
        </div>
        <div class="product-foot">
          <span class="product-store"><AppIcon name="bag" :size="12" /><span>{{ product.store }}</span></span>
          <span class="rating"><AppIcon name="star" :size="11" />{{ product.rating }}</span>
        </div>
      </div>
    </button>
  </article>
</template>

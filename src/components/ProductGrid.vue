<script setup lang="ts">
import type { Product } from '../types'
import ProductCard from './ProductCard.vue'

defineProps<{ products: Product[]; savedIds: number[] }>()
const emit = defineEmits<{ open: [product: Product]; toggleSave: [id: number] }>()
</script>

<template>
  <div class="product-grid">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :saved="savedIds.includes(product.id)"
      @open="emit('open', $event)"
      @toggle-save="emit('toggleSave', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { role } = store
</script>

<template>
  <div class="role-selector" role="group" aria-label="Switch between shopping and your seller tools">
    <span class="role-selector-label">View</span>
    <div class="role-options">
      <button type="button" :aria-pressed="role === 'Buyer'" @click="store.setSellerMode(false)">Shopping</button>
      <button type="button" :aria-pressed="role === 'Seller'" @click="store.setSellerMode(true)">Selling</button>
    </div>
  </div>
</template>

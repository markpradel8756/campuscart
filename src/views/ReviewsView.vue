<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { SEED_STORE, SELLER_REVIEWS } from '../data/demoData'

const { storeName } = useMarketplace()
const isSeedStore = computed(() => storeName.value === SEED_STORE)
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Reviews</span>
      <h1>A little love from campus</h1>
      <p>{{ isSeedStore ? '4.9 average rating · 24 student reviews' : 'No reviews yet' }}</p>
    </header>

    <div v-if="isSeedStore" class="reviews-grid">
      <article v-for="r in SELLER_REVIEWS" :key="r.author" class="review-card">
        <span class="stars" aria-label="5 out of 5 stars"><AppIcon v-for="n in 5" :key="n" name="star" :size="14" /></span>
        <blockquote>“{{ r.text }}”</blockquote>
        <cite>— {{ r.author }} <span class="badge"><AppIcon name="check" :size="11" />Verified purchase</span></cite>
      </article>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon"><AppIcon name="star" :size="22" /></div>
      <h3>Your first review is on its way</h3>
      <p>Reviews from students show up here after completed campus pickups.</p>
    </div>
  </div>
</template>

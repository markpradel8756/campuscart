<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import ProductGrid from '../components/ProductGrid.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { CATEGORIES, CONDITIONS, HERO_AVATARS, HERO_IMAGE } from '../data/demoData'

const store = useMarketplace()
const { filters, filteredProducts, savedIds, hasActiveFilters } = store

const listingTitle = computed(() => {
  if (filters.savedOnly) return 'Your saved finds'
  if (filters.category !== 'All items') return filters.category
  return 'Fresh finds on campus'
})
const isDefaultListing = computed(() => !filters.savedOnly && filters.category === 'All items')

const benefits = [
  { icon: 'shield', title: 'Trusted by your campus community', text: 'Verified students and approved campus sellers' },
  { icon: 'walk', title: 'No shipping. Just a short walk.', text: 'Easy, convenient campus pickups' },
  { icon: 'leaf', title: 'Good for you. Better for the planet.', text: 'Give pre-loved finds a new beginning' },
]
</script>

<template>
  <div class="market">
    <div class="container">
      <!-- Hero -->
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <span class="eyebrow">By students. For students.</span>
          <h1 id="hero-title">
            Good finds.<br />
            Great campus
            <span class="underline-word">connections.
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 10.5C42 4.5 92 2.6 197 6.2" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                <path d="M30 12.2c40-3.6 90-4.4 140-2.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7" />
              </svg>
            </span>
          </h1>
          <p>
            Buy, sell, and discover a little of everything.<br />
            From your campus community, just a few steps away.
          </p>
          <div class="hero-actions">
            <button type="button" class="btn btn-primary" @click="store.scrollToBrowse()">
              Explore the marketplace <AppIcon name="arrow-right" :size="16" />
            </button>
            <div class="social-proof">
              <div class="avatar-stack" aria-hidden="true">
                <img v-for="src in HERO_AVATARS" :key="src" :src="src" alt="" />
                <span>+2k</span>
              </div>
              Good finds. Even better people.
            </div>
          </div>
        </div>

        <div class="hero-media">
          <img :src="HERO_IMAGE" alt="Students walking together across a sunny university campus" />
          <div class="hero-chip">
            <span class="chip-icon"><AppIcon name="home" :size="13" /></span>
            A marketplace that feels like home.
          </div>
          <div class="hero-sticker">
            <svg class="sunburst" viewBox="0 0 40 40" aria-hidden="true">
              <g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <path d="M20 3v7M20 30v7M3 20h7M30 20h7M8 8l5 5M27 27l5 5M8 32l5-5M27 13l5-5" />
              </g>
            </svg>
            <span class="leaf"><AppIcon name="leaf" :size="14" /></span>
            <strong>Pass it on. Make it count.</strong>
            <p>Better for your wallet. Better for the planet.</p>
          </div>
        </div>
      </section>

      <!-- Benefits -->
      <section class="benefits" aria-label="Why CampusCart">
        <div v-for="b in benefits" :key="b.title" class="benefit">
          <span class="benefit-icon"><AppIcon :name="b.icon" :size="18" /></span>
          <div>
            <strong>{{ b.title }}</strong>
            <small>{{ b.text }}</small>
          </div>
        </div>
      </section>

      <!-- Browse -->
      <section id="browse" class="browse" aria-labelledby="browse-title">
        <div class="browse-head">
          <div>
            <span class="eyebrow">The campus collection</span>
            <h2 id="browse-title" class="section-title">What are you looking for?</h2>
          </div>
          <button
            type="button"
            class="saved-toggle"
            :class="{ active: filters.savedOnly }"
            :aria-pressed="filters.savedOnly"
            :aria-label="filters.savedOnly ? 'Show all finds' : 'Your saved finds'"
            @click="filters.savedOnly = !filters.savedOnly"
          >
            <AppIcon :name="filters.savedOnly ? 'grid' : 'heart'" :size="15" />
            <span class="saved-label">{{ filters.savedOnly ? 'Show all finds' : 'Your saved finds' }}</span>
            <span v-if="savedIds.length > 0 && !filters.savedOnly" class="saved-count">{{ savedIds.length }}</span>
          </button>
        </div>

        <div class="search-row">
          <label class="search-box">
            <span class="sr-only">Search products</span>
            <AppIcon name="search" :size="17" />
            <input
              v-model="filters.search"
              class="input"
              type="search"
              placeholder="Search for textbooks, gadgets, and your next great find..."
            />
            <span class="kbd-hint" aria-hidden="true">⌘ K</span>
          </label>
          <button
            type="button"
            class="btn btn-secondary filters-btn"
            :class="{ active: filters.panelOpen }"
            :aria-expanded="filters.panelOpen"
            aria-controls="filter-panel"
            aria-label="Filters"
            @click="filters.panelOpen = !filters.panelOpen"
          >
            <AppIcon name="sliders" :size="17" />
            <span class="filters-label">Filters</span>
            <span v-if="hasActiveFilters" class="filter-dot" aria-label="Filters applied" />
          </button>
        </div>

        <div v-if="filters.panelOpen" id="filter-panel" class="filter-panel">
          <label class="field">
            <span>Condition</span>
            <select v-model="filters.condition" class="select">
              <option value="">Any condition</option>
              <option v-for="c in CONDITIONS" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label class="field">
            <span>Maximum price</span>
            <span class="price-input">
              <span aria-hidden="true">₱</span>
              <input v-model="filters.maxPrice" class="input" type="number" min="0" inputmode="numeric" placeholder="No limit" aria-label="Maximum price in Philippine pesos" />
            </span>
          </label>
          <button type="button" class="btn btn-ghost" @click="store.resetFilters()">
            <AppIcon name="refresh" :size="14" /> Reset filters
          </button>
        </div>

        <div class="categories" role="group" aria-label="Categories">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.name"
            type="button"
            class="category-chip"
            :class="{ active: filters.category === cat.name }"
            :aria-pressed="filters.category === cat.name"
            @click="filters.category = cat.name"
          >
            <AppIcon :name="cat.icon" :size="15" />
            {{ cat.name }}
          </button>
        </div>

        <div class="listing-head">
          <div>
            <h3>
              {{ listingTitle }}
              <span v-if="isDefaultListing" class="badge badge-yellow"><AppIcon name="sparkle" :size="11" />Just for you</span>
            </h3>
            <p>A new favorite might be one click away.</p>
          </div>
          <label class="sort-select">
            Sort by
            <select v-model="filters.sort" class="select">
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <ProductGrid
          v-if="filteredProducts.length"
          :products="filteredProducts"
          :saved-ids="savedIds"
          @open="store.openProduct"
          @toggle-save="store.toggleSaved"
        />
        <div v-else class="empty-state">
          <div class="empty-icon"><AppIcon name="search" :size="22" /></div>
          <h3>No finds just yet</h3>
          <p>Try another search or clear your filters.</p>
          <button type="button" class="btn btn-primary" @click="store.showAllProducts()">Show all products</button>
        </div>
      </section>

      <!-- Selling banner -->
      <section class="sell-banner" aria-labelledby="sell-title">
        <span class="sell-banner-deco" aria-hidden="true" />
        <div>
          <span class="eyebrow">Less clutter. More possibilities.</span>
          <h2 id="sell-title">Someone on campus needs what you don’t.</h2>
          <p>Make some space. Earn a little extra. Start your campus store.</p>
        </div>
        <button type="button" class="btn" @click="store.navigate(store.isApprovedSeller.value ? 'dashboard' : 'sell')">
          Start selling <AppIcon name="arrow-right" :size="16" />
        </button>
      </section>
    </div>
  </div>
</template>

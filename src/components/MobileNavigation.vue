<script setup lang="ts">
import { computed, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import AppLogo from './AppLogo.vue'
import ModeSwitch from './ModeSwitch.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { BOTTOM_NAV, HEADER_NAV, SIDEBAR_NAV } from '../data/navigation'
import type { Page } from '../types'

const store = useMarketplace()
const { role, currentPage, selectedProduct, mobileMenuOpen, isGuest, isAdmin, isApprovedSeller, currentAccount } = store

const drawerItems = computed(() =>
  role.value === 'Buyer'
    ? [
        ...HEADER_NAV.Buyer,
        { label: 'Shopping cart', page: 'cart' as Page, icon: 'cart' },
        { label: 'Notifications', page: 'notifications' as Page, icon: 'bell' },
        { label: 'Profile & settings', page: 'profile' as Page, icon: 'user' },
      ]
    : SIDEBAR_NAV[role.value],
)

const bottomItems = computed(() => BOTTOM_NAV[role.value])

const isActive = (page: Page | 'explore') => !selectedProduct.value && page !== 'explore' && currentPage.value === page

function go(page: Page | 'explore') {
  if (page === 'explore') store.explore()
  else store.navigate(page)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') mobileMenuOpen.value = false
}
watch(mobileMenuOpen, (open) => {
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="mobileMenuOpen" class="drawer-backdrop" @click="mobileMenuOpen = false" />
    </Transition>
    <Transition name="drawer">
      <nav v-if="mobileMenuOpen" class="drawer" aria-label="Mobile menu" role="dialog" aria-modal="true">
        <div class="drawer-head">
          <AppLogo />
          <button type="button" class="icon-btn" aria-label="Close menu" @click="mobileMenuOpen = false">
            <AppIcon name="x" :size="20" />
          </button>
        </div>
        <p class="drawer-section">{{ role === 'Buyer' ? 'Browse' : role === 'Admin' ? 'Demo admin' : 'Seller workspace' }}</p>
        <button
          v-for="item in drawerItems"
          :key="item.page + item.label"
          type="button"
          class="side-link"
          :class="{ active: isActive(item.page) }"
          @click="store.navigate(item.page)"
        >
          <AppIcon :name="item.icon" :size="17" />
          {{ item.label }}
        </button>
        <template v-if="!isAdmin && !isApprovedSeller">
          <p class="drawer-section">Sell on campus</p>
          <button type="button" class="side-link" :class="{ active: isActive('sell') }" @click="store.navigate('sell')">
            <AppIcon name="store" :size="17" />
            {{ currentAccount?.sellerStatus === 'pending' ? 'Application pending' : 'Become a seller' }}
          </button>
        </template>

        <div class="drawer-foot">
          <ModeSwitch v-if="isApprovedSeller" />
          <template v-if="isGuest">
            <RouterLink :to="store.authLocation('login')" class="btn btn-primary btn-block">Sign in</RouterLink>
            <RouterLink :to="store.authLocation('register')" class="btn btn-secondary btn-block">Create an account</RouterLink>
          </template>
          <button v-else type="button" class="btn btn-secondary btn-block" @click="store.logout()">
            <AppIcon name="logout" :size="15" /> {{ isAdmin ? 'Exit demo admin' : 'Sign out' }}
          </button>
          <button type="button" class="btn btn-ghost" @click="store.openModal('campus')">
            <AppIcon name="map-pin" :size="15" /> Main Campus
          </button>
          <RouterLink v-if="!isAdmin" :to="store.authLocation('admin-login')" class="btn btn-ghost">
            <AppIcon name="lock" :size="15" /> Demo admin access
          </RouterLink>
          <p class="field-hint">Frontend demo only. Sign-in, payments and admin access are simulated.</p>
        </div>
      </nav>
    </Transition>
  </Teleport>

  <nav class="bottom-nav" aria-label="Quick navigation">
    <button
      v-for="item in bottomItems"
      :key="item.label"
      type="button"
      :class="{ active: isActive(item.page) }"
      :aria-current="isActive(item.page) ? 'page' : undefined"
      @click="go(item.page)"
    >
      <AppIcon :name="item.icon" :size="20" />
      {{ item.label }}
      <span v-if="item.page === 'messages' && !isGuest" class="dot-yellow nav-dot" aria-hidden="true" />
    </button>
  </nav>
</template>

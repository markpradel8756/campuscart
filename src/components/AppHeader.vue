<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import AppLogo from './AppLogo.vue'
import AccountActions from './AccountActions.vue'
import { useMarketplace } from '../composables/useMarketplace'
import { HEADER_NAV } from '../data/navigation'
import { initialsOf } from '../data/demoData'

const store = useMarketplace()
const { role, currentPage, selectedProduct, cartCount, unreadCount, mobileMenuOpen, isGuest, isAdmin, currentAccount } = store

const navItems = computed(() => HEADER_NAV[role.value])
const homePage = computed(() => (role.value === 'Buyer' ? 'marketplace' : 'dashboard'))
const isActive = (page: string) => !selectedProduct.value && currentPage.value === page
const initials = computed(() => initialsOf(currentAccount.value?.name ?? ''))
</script>

<template>
  <div class="announcement">
    <div class="container">
      <p class="announcement-left">A little closer. A little greener. Your campus, your marketplace.</p>
      <p class="announcement-right">
        <AppIcon name="shield" :size="13" />
        Exclusively for our campus community
      </p>
    </div>
  </div>

  <header class="site-header">
    <div class="container">
      <button
        type="button"
        class="icon-btn menu-btn"
        aria-label="Open menu"
        :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = true"
      >
        <AppIcon name="menu" :size="20" />
      </button>

      <button type="button" aria-label="CampusCart home" @click="store.navigate(homePage)">
        <AppLogo />
      </button>

      <nav class="main-nav" aria-label="Main">
        <button
          v-for="item in navItems"
          :key="item.page"
          type="button"
          :class="{ active: isActive(item.page) }"
          :aria-current="isActive(item.page) ? 'page' : undefined"
          @click="store.navigate(item.page)"
        >
          {{ item.label }}
          <span v-if="item.page === 'messages' && !isGuest" class="dot-yellow" aria-hidden="true" />
        </button>
      </nav>

      <div class="header-actions">
        <button type="button" class="campus-picker" @click="store.openModal('campus')">
          <AppIcon name="map-pin" :size="15" />
          Main Campus
          <AppIcon name="chevron-down" :size="14" />
        </button>
        <span class="v-divider" aria-hidden="true" />
        <template v-if="!isAdmin">
          <button
            v-if="!isGuest"
            type="button"
            class="icon-btn"
            :aria-label="unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'"
            @click="store.navigate('notifications')"
          >
            <AppIcon name="bell" :size="20" />
            <span v-if="unreadCount" class="unread-dot" />
          </button>
          <button
            type="button"
            class="icon-btn"
            :aria-label="`Shopping cart, ${cartCount} items`"
            @click="store.navigate('cart')"
          >
            <AppIcon name="cart" :size="20" />
            <span v-if="cartCount" class="count-badge">{{ cartCount }}</span>
          </button>
        </template>
        <RouterLink v-if="isGuest" :to="store.authLocation('login')" class="btn btn-primary btn-sm signin-btn" aria-label="Sign in">
          <AppIcon name="user" :size="15" /><span>Sign in</span>
        </RouterLink>
        <button v-else-if="isAdmin" type="button" class="avatar header-avatar admin-avatar" aria-label="Admin dashboard" @click="store.navigate('dashboard')">
          <AppIcon name="shield" :size="16" />
        </button>
        <button v-else type="button" class="avatar header-avatar" aria-label="Profile and settings" @click="store.navigate('profile')">
          {{ initials }}
        </button>
      </div>
    </div>
  </header>

  <div class="subbar">
    <div class="container">
      <p class="subbar-left">
        <span class="status-dot" />
        <template v-if="isAdmin">Demo admin view · actions are simulated.</template>
        <template v-else-if="currentAccount">Hi, {{ currentAccount.name.split(' ')[0] }}! Your next find is right on campus.</template>
        <template v-else>Your next find is right on campus.</template>
      </p>
      <AccountActions />
    </div>
  </div>
</template>

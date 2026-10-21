<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Page } from './types'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import DashboardSidebar from './components/DashboardSidebar.vue'
import MobileNavigation from './components/MobileNavigation.vue'
import ToastNotification from './components/ToastNotification.vue'
import ReportModal from './components/modals/ReportModal.vue'
import ProductEditorModal from './components/modals/ProductEditorModal.vue'
import ReviewModal from './components/modals/ReviewModal.vue'
import SimpleModals from './components/modals/SimpleModals.vue'
import { useMarketplace } from './composables/useMarketplace'
import { SIDEBAR_NAV } from './data/navigation'

const store = useMarketplace()
const { role, currentPage, modal, mobileMenuOpen, pendingApplications, openReports, pendingOrders } = store

const sidebarItems = computed(() => (role.value === 'Buyer' ? [] : SIDEBAR_NAV[role.value]))
const sidebarCounts = computed<Partial<Record<Page, number>>>(() =>
  role.value === 'Admin'
    ? { vendors: pendingApplications.value, reports: openReports.value }
    : { orders: pendingOrders.value },
)
const activePage = computed(() => currentPage.value as Page)

// Lock page scroll while a modal or the mobile drawer is open.
watch(
  () => modal.name !== null || mobileMenuOpen.value,
  (locked) => (document.body.style.overflow = locked ? 'hidden' : ''),
)
</script>

<template>
  <a href="#main" class="sr-only">Skip to content</a>
  <AppHeader />

  <RouterView v-slot="{ Component, route }">
    <main id="main" class="app-main" :class="{ 'workspace-wrap': route.meta.layout === 'workspace' }">
      <div v-if="route.meta.layout === 'workspace'" class="workspace">
        <DashboardSidebar
          :items="sidebarItems"
          :active="activePage"
          :label="role === 'Admin' ? 'Admin workspace' : 'Seller workspace'"
          :counts="sidebarCounts"
          @navigate="store.navigate"
        />
        <div class="workspace-main">
          <component :is="Component" :key="route.fullPath" />
        </div>
      </div>

      <component :is="Component" v-else-if="route.meta.layout === 'full'" :key="route.path" />

      <div v-else class="page">
        <div class="container">
          <component :is="Component" :key="route.path" />
        </div>
      </div>
    </main>
  </RouterView>

  <AppFooter />
  <MobileNavigation />

  <ReportModal />
  <ProductEditorModal />
  <ReviewModal />
  <SimpleModals />
  <ToastNotification />
</template>

<script setup lang="ts">
import AppLogo from './AppLogo.vue'
import AppIcon from './AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { storageWorking } = store

function reset() {
  if (window.confirm('Reset all demo data (accounts, orders, listings, applications) to the starting state?')) store.resetDemo()
}
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-brand">
        <AppLogo />
        <span class="footer-tag">A little closer. A little greener.</span>
      </div>
      <div class="footer-right">
        <p class="footer-note">
          Made for our campus community. Frontend demo only.
          <template v-if="!storageWorking"> Saving is unavailable in this browser.</template>
        </p>
        <button type="button" class="footer-reset" @click="reset"><AppIcon name="refresh" :size="13" />Reset demo data</button>
      </div>
    </div>
  </footer>
</template>

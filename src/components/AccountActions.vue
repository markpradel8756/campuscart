<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import ModeSwitch from './ModeSwitch.vue'
import { useMarketplace } from '../composables/useMarketplace'

/** Right side of the secondary bar: selling entry, view switch, and the separate demo admin entry. */
const store = useMarketplace()
const { isAdmin, isApprovedSeller, currentAccount } = store
</script>

<template>
  <div class="subbar-right">
    <template v-if="isAdmin">
      <span class="badge badge-yellow"><AppIcon name="shield" :size="11" />Demo admin access</span>
      <span class="v-divider" aria-hidden="true" />
      <button type="button" class="subbar-link" @click="store.logout()">
        <AppIcon name="logout" :size="14" /><span>Exit admin</span>
      </button>
    </template>
    <template v-else>
      <ModeSwitch v-if="isApprovedSeller" />
      <button v-else type="button" class="subbar-link" @click="store.navigate('sell')">
        <AppIcon name="store" :size="14" />
        <span>{{ currentAccount?.sellerStatus === 'pending' ? 'Seller application pending' : 'Become a seller' }}</span>
      </button>
      <span class="v-divider" aria-hidden="true" />
      <RouterLink :to="store.authLocation('admin-login')" class="subbar-admin">
        <AppIcon name="lock" :size="13" /><span>Demo admin</span>
      </RouterLink>
    </template>
  </div>
</template>

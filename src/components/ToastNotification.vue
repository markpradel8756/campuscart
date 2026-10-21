<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useMarketplace } from '../composables/useMarketplace'

const { toast, dismissToast } = useMarketplace()
</script>

<template>
  <Teleport to="body">
    <div class="toast-wrap" role="status" aria-live="polite" aria-atomic="true">
      <Transition name="toast">
        <div v-if="toast" :key="toast.id" class="toast">
          <span class="toast-check"><AppIcon name="check" :size="14" :stroke-width="2.4" /></span>
          <span>{{ toast.message }}</span>
          <button type="button" class="toast-close" aria-label="Dismiss notification" @click="dismissToast">
            <AppIcon name="x" :size="15" />
          </button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

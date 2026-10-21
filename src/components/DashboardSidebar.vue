<script setup lang="ts">
import type { NavItem } from '../data/navigation'
import type { Page } from '../types'
import AppIcon from './AppIcon.vue'

defineProps<{ items: NavItem[]; active: Page | null; label: string; counts?: Partial<Record<Page, number>> }>()
const emit = defineEmits<{ navigate: [page: Page] }>()
</script>

<template>
  <aside class="sidebar" :aria-label="`${label} navigation`">
    <div class="sidebar-sticky">
      <p class="sidebar-label">{{ label }}</p>
      <button
        v-for="item in items"
        :key="item.page + item.label"
        type="button"
        class="side-link"
        :class="{ active: active === item.page }"
        :aria-current="active === item.page ? 'page' : undefined"
        @click="emit('navigate', item.page)"
      >
        <AppIcon :name="item.icon" :size="17" />
        {{ item.label }}
        <span v-if="counts?.[item.page]" class="side-count">{{ counts[item.page] }}</span>
      </button>
      <div class="sidebar-note">
        <strong><AppIcon name="leaf" :size="14" />Campus community first.</strong>
        <p>This is a frontend demo. No real payments or data storage.</p>
      </div>
    </div>
  </aside>
</template>

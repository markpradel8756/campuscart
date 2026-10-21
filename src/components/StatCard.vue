<script setup lang="ts">
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ label: string; value: string | number; icon: string; hint?: string; suffix?: string; tone?: 'green' | 'yellow' }>(), {
  hint: 'CampusCart · Demo data',
  suffix: '',
  tone: 'green',
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-top">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-icon" :class="{ yellow: tone === 'yellow' }"><AppIcon :name="icon" :size="17" /></span>
    </div>
    <p class="stat-value">{{ value }}<small v-if="suffix"> {{ suffix }}</small></p>
    <p class="stat-hint">{{ hint }}</p>
  </div>
</template>

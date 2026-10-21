<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const tone = computed(() => {
  switch (props.status) {
    case 'Pending':
      return 'badge-yellow'
    case 'Confirmed':
    case 'Under review':
      return 'badge-blue'
    case 'Ready for Pickup':
    case 'Completed':
    case 'Approved':
    case 'Resolved':
    case 'Published':
      return ''
    case 'Cancelled':
    case 'Rejected':
      return 'badge-red'
    default:
      return 'badge-gray'
  }
})
</script>

<template>
  <span class="badge" :class="tone">{{ status }}</span>
</template>

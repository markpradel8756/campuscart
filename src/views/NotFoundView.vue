<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'

const route = useRoute()
</script>

<template>
  <div class="empty-state" style="margin-top: 10px">
    <div class="empty-icon"><AppIcon name="compass" :size="22" /></div>
    <h3>This page wandered off campus</h3>
    <p>CampusCart couldn’t find <code>{{ route.fullPath }}</code>. It may have moved, or the link may be mistyped.</p>
    <RouterLink to="/" class="btn btn-primary">Back to the marketplace</RouterLink>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '../components/AppIcon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { reports } = store
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Trust &amp; safety</span>
      <h1>Product reports</h1>
      <p>Help keep our campus marketplace safe and trustworthy.</p>
    </header>

    <div class="card-list">
      <article v-for="r in reports" :key="r.id" class="report-card">
        <div class="report-top">
          <div>
            <h3>{{ r.name }}</h3>
            <span class="report-reason"><AppIcon name="flag" :size="14" />{{ r.reason }}</span>
          </div>
          <StatusBadge :status="r.status" />
        </div>
        <p class="reporter">Reported by {{ r.reporter }} · Main Campus</p>
        <div v-if="r.status !== 'Resolved'" class="card-actions">
          <button v-if="r.status === 'Pending'" type="button" class="btn btn-secondary btn-sm" @click="store.setReportStatus(r, 'Under review')">
            <AppIcon name="eye" :size="14" /> Mark under review
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="store.setReportStatus(r, 'Resolved')">
            <AppIcon name="check" :size="14" /> Resolve report
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

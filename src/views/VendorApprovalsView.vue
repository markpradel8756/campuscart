<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useMarketplace } from '../composables/useMarketplace'

const store = useMarketplace()
const { vendors } = store
// Newest applications first.
const list = computed(() => [...vendors.value].reverse())
</script>

<template>
  <div>
    <header class="page-head">
      <span class="eyebrow">Seller applications</span>
      <h1>Vendor applications</h1>
      <p>Review campus businesses before they join the marketplace. Decisions update the applicant’s account right away.</p>
    </header>

    <div class="card-list">
      <article v-for="v in list" :key="v.id" class="vendor-card">
        <div class="vendor-top">
          <span class="vendor-logo"><AppIcon name="store" :size="20" /></span>
          <div>
            <h3>{{ v.name }}</h3>
            <small>{{ v.type }}</small>
          </div>
          <StatusBadge :status="v.status" />
        </div>
        <p class="applicant">Applicant: <b>{{ v.applicant || 'Campus business' }}</b><template v-if="v.email"> · {{ v.email }}</template><template v-if="v.accountId"> · Demo account</template></p>
        <p v-if="v.description" class="applicant">{{ v.description }}</p>
        <div class="facts">
          <div><small>Permit</small><span>{{ v.permit }}</span></div>
          <div><small>Sells</small><span>{{ v.category }}</span></div>
          <div><small>Location</small><span>{{ v.location }}</span></div>
        </div>
        <div v-if="v.status === 'Pending'" class="card-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="store.openModal('vendor-confirm', { vendor: v, vendorAction: 'approve' })">
            <AppIcon name="check" :size="14" /> Approve vendor
          </button>
          <button type="button" class="btn btn-danger btn-sm" @click="store.openModal('vendor-confirm', { vendor: v, vendorAction: 'reject' })">
            Reject application
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

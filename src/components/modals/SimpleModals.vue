<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '../BaseModal.vue'
import AppIcon from '../AppIcon.vue'
import { useMarketplace } from '../../composables/useMarketplace'

const store = useMarketplace()
const { modal } = store

const isApprove = computed(() => modal.vendorAction === 'approve')

function confirmVendor() {
  const v = modal.vendor
  store.closeModal()
  if (v) store.decideApplication(v, isApprove.value ? 'Approved' : 'Rejected')
}

function viewOrders() {
  store.closeModal()
  store.navigate('orders')
}
</script>

<template>
  <BaseModal :open="modal.name === 'campus'" title="Your campus community" center @close="store.closeModal()">
    <template #header="{ titleId }">
      <div class="success-icon"><AppIcon name="map-pin" :size="26" /></div>
      <h2 :id="titleId">Your campus community</h2>
    </template>
    <p class="modal-desc">Currently browsing Main Campus. Other campuses are coming soon in this demo.</p>
    <button type="button" class="btn btn-primary btn-block" @click="store.closeModal()">Stay on Main Campus</button>
  </BaseModal>

  <BaseModal
    :open="modal.name === 'vendor-confirm'"
    :title="isApprove ? 'Approve this vendor?' : 'Reject this application?'"
    @close="store.closeModal()"
  >
    <template #header="{ titleId }">
      <span class="eyebrow">Vendor approvals</span>
      <h2 :id="titleId">{{ isApprove ? 'Approve this vendor?' : 'Reject this application?' }}</h2>
    </template>
    <div v-if="modal.vendor" class="product-mini">
      <span class="vendor-logo" style="width: 40px; height: 40px"><AppIcon name="store" :size="18" /></span>
      {{ modal.vendor.name }} · {{ modal.vendor.permit }}
    </div>
    <p class="notice"><AppIcon name="info" :size="15" />This is a simulated admin action.<template v-if="modal.vendor?.accountId"> The applicant’s demo account will {{ isApprove ? 'unlock seller tools' : 'show the application as not approved' }}.</template></p>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" @click="store.closeModal()">Cancel</button>
      <button type="button" class="btn" :class="isApprove ? 'btn-primary' : 'btn-danger'" @click="confirmVendor">
        {{ isApprove ? 'Approve vendor' : 'Reject application' }}
      </button>
    </div>
  </BaseModal>

  <BaseModal :open="modal.name === 'order-success'" title="You’re all set!" center @close="store.closeModal()">
    <template #header="{ titleId }">
      <div class="success-icon"><AppIcon name="check-circle" :size="30" /></div>
      <span class="eyebrow">A good find is on its way</span>
      <h2 :id="titleId">You’re all set!</h2>
    </template>
    <p class="modal-desc">Your sample order has been placed. Your seller will confirm your campus pickup soon.</p>
    <p class="notice" style="text-align: left"><AppIcon name="info" :size="15" />This is a prototype. No payment was processed.</p>
    <button type="button" class="btn btn-primary btn-block" style="margin-top: 18px" @click="viewOrders">View my orders</button>
  </BaseModal>
</template>
